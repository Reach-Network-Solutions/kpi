# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from collections import OrderedDict
from hashlib import md5
from jsonfield import JSONField
import os

from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.conf import settings
from django.db import ProgrammingError
from django.utils.translation import ugettext_lazy as _

try:
    from django.contrib.contenttypes.fields import GenericForeignKey
except ImportError:
    from django.contrib.contenttypes.generic import GenericForeignKey

from formpack.constants import UNTRANSLATED
from kobo.apps.reports.report_data import build_formpack


class ReadOnlyModelError(ValueError):
    pass


class _ShadowModel(models.Model):
    ''' Allows identification of writeable and read-only shadow models '''
    class Meta:
        abstract = True

class _ReadOnlyModel(_ShadowModel):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        raise ReadOnlyModelError('Cannot save read-only-model')

    def delete(self, *args, **kwargs):
        raise ReadOnlyModelError('Cannot delete read-only-model')

    @classmethod
    def upload_to(self, *args, **kwargs):
        raise ReadOnlyModelError('Cannot use read-only-model to upload assets')

class LazyModelGroup:
    @property
    def XForm(self):
        if not hasattr(self, '_XForm'):
            self._define()
        return self._XForm

    @property
    def Instance(self):
        if not hasattr(self, '_Instance'):
            self._define()
        return self._Instance

    @property
    def Attachment(self):
        if not hasattr(self, '_Attachment'):
            self._define()
        return self._Attachment

    @property
    def UserProfile(self):
        if not hasattr(self, '_UserProfile'):
            self._define()
        return self._UserProfile

    @property
    def UserObjectPermission(self):
        if not hasattr(self, '_UserObjectPermission'):
            self._define()
        return self._UserObjectPermission

    @staticmethod
    def get_content_type_for_model(model):
        MODEL_NAME_MAPPING = {
            '_readonlyxform': ('logger', 'xform'),
            '_readonlyinstance': ('logger', 'instance'),
            '_readonlyattachment': ('logger', 'attachment'),
            '_userprofile': ('main', 'userprofile'),
            '_userobjectpermission': ('guardian', 'userobjectpermission'),
        }
        try:
            app_label, model_name = MODEL_NAME_MAPPING[model._meta.model_name]
        except KeyError:
            raise NotImplementedError
        return ContentType.objects.get(app_label=app_label, model=model_name)

    def _define(self):
        class _ReadOnlyXform(_ReadOnlyModel):
            class Meta:
                managed = False
                db_table = 'logger_xform'
                verbose_name = 'xform'
                verbose_name_plural = 'xforms'

            XFORM_TITLE_LENGTH = 255
            xls = models.FileField(null=True)
            xml = models.TextField()
            json = models.TextField(default=u'')
            user = models.ForeignKey(User, related_name='xforms', null=True)
            shared = models.BooleanField(default=False)
            shared_data = models.BooleanField(default=False)
            downloadable = models.BooleanField(default=True)
            id_string = models.SlugField()
            title = models.CharField(max_length=XFORM_TITLE_LENGTH)
            date_created = models.DateTimeField()
            date_modified = models.DateTimeField()
            uuid = models.CharField(max_length=32, default=u'')
            last_submission_time = models.DateTimeField(blank=True, null=True)
            num_of_submissions = models.IntegerField(default=0)

            @property
            def hash(self):
                return u'%s' % md5(self.xml.encode('utf8')).hexdigest()

            @property
            def prefixed_hash(self):
                ''' Matches what's returned by the KC API '''
                return u"md5:%s" % self.hash

            @property
            def questions(self):
                try:
                    _questions = []
                    if self.pack:
                        versions = self.pack.versions
                        fields = self.pack.get_fields_for_versions(versions=versions.keys())
                        latest_version_uid = versions.keys()[-1]
                        latest_version_fields = self.pack.get_fields_for_versions(versions=[latest_version_uid])

                        for index, field in enumerate(fields):
                            labels = field.get_labels(UNTRANSLATED)
                            _questions.append({
                                "type": field.data_type,
                                "name": field.path,
                                "number": index + 1,
                                "label": labels[0],
                                "in_latest_version": field in latest_version_fields
                            })

                    return _questions
                except ValueError:
                    return []

            @property
            def asset(self):
                if not hasattr(self, "_asset"):
                    from kpi.models.asset import Asset  # Import here because of circular imports
                    try:
                        setattr(self, "_asset", Asset.objects.get(uid=self.id_string))
                    except Asset.DoesNotExist:
                        setattr(self, "_asset", None)

                return self._asset

            @property
            def pack(self):
                if not hasattr(self, "_pack") and self.asset:
                    pack, submission_stream = build_formpack(self.asset)
                    setattr(self, "_pack", pack)
                return getattr(self, "_pack", None)

            def reset_pack(self):
                """
                Only used for unittests purpose
                """
                setattr(self, "_asset", None)
                setattr(self, "_pack", None)

        class _ReadOnlyInstance(_ReadOnlyModel):
            class Meta:
                managed = False
                db_table = 'logger_instance'
                verbose_name = 'instance'
                verbose_name_plural = 'instances'

            xml = models.TextField()
            json = JSONField(default={}, null=False)
            user = models.ForeignKey(User, null=True)
            xform = models.ForeignKey(_ReadOnlyXform, related_name='instances')
            date_created = models.DateTimeField()
            date_modified = models.DateTimeField()
            deleted_at = models.DateTimeField(null=True, default=None)
            status = models.CharField(max_length=20,
                                      default=u'submitted_via_web')
            uuid = models.CharField(max_length=249, default=u'')

            @property
            def submission(self):
                try:
                    username = self.xform.user.username
                except:
                    username = None

                return OrderedDict({
                    'xform_id': self.xform.id_string,
                    'id': self.id,
                    'instance_uuid': self.uuid,
                    'username': username,
                    'status': self.status,
                    'date_created': self.date_created,
                    'date_modified': self.date_modified
                })

        class _ReadOnlyAttachment(_ReadOnlyModel):
            class Meta:
                managed = False
                db_table = 'logger_attachment'
                verbose_name = 'attachment'
                verbose_name_plural = 'attachments'

            instance = models.ForeignKey(_ReadOnlyInstance, related_name="attachments")
            media_file = models.FileField(upload_to=_ReadOnlyModel.upload_to, max_length=380)
            mimetype = models.CharField(max_length=50, null=False, blank=True, default='')

            @property
            def filename(self):
                return os.path.basename(self.media_file.name)

            @property
            def question_name(self):
                qa_dict = self.instance.json
                if self.filename not in qa_dict.values():
                    return None

                return qa_dict.keys()[qa_dict.values().index(self.filename)]

            @property
            def question(self):
                if not self.question_name or not self.instance.xform.questions:
                    return None

                for question in self.instance.xform.questions:
                    if question['name'] == self.question_name:
                        return question

                return None

            @property
            def question_index(self):
                if not self.question:
                    return self.id

                return self.question['number']

            @property
            def can_view_submission(self):
                # TODO: Only attachments synced to s3 should be viewable by other users
                # Can determine this by looking at media_file upload properties
                # Alternatively, can move this into User Profile or Asset permissions logic
                return True

            def secure_url(self, suffix="original"):
                """
                Returns image URL through kobocat redirector.
                :param suffix: str. original|large|medium|small
                :return: str
                """
                if suffix != "original" and suffix not in settings.THUMB_CONF.keys():
                    raise Exception("Invalid image thumbnail")

                return "{kobocat_url}{media_url}{suffix}?media_file={filename}".format(
                    kobocat_url=settings.KOBOCAT_URL,
                    media_url=settings.MEDIA_URL,
                    suffix=suffix,
                    filename=self.media_file.name
                )

        class _UserProfile(_ShadowModel):
            '''
            From onadata/apps/main/models/user_profile.py
            Not read-only because we need write access to `require_auth`
            '''
            class Meta:
                managed = False
                db_table = 'main_userprofile'
                verbose_name = 'user profile'
                verbose_name_plural = 'user profiles'

            # This field is required.
            user = models.OneToOneField(User, related_name='profile')

            # Other fields here
            name = models.CharField(max_length=255, blank=True)
            city = models.CharField(max_length=255, blank=True)
            country = models.CharField(max_length=2, blank=True)
            organization = models.CharField(max_length=255, blank=True)
            home_page = models.CharField(max_length=255, blank=True)
            twitter = models.CharField(max_length=255, blank=True)
            description = models.CharField(max_length=255, blank=True)
            require_auth = models.BooleanField(
                default=False,
                verbose_name=_(
                    "Require authentication to see forms and submit data"
                )
            )
            address = models.CharField(max_length=255, blank=True)
            phonenumber = models.CharField(max_length=30, blank=True)
            created_by = models.ForeignKey(User, null=True, blank=True)
            num_of_submissions = models.IntegerField(default=0)
            metadata = JSONField(default={}, blank=True)

        class _UserObjectPermission(_ShadowModel):
            '''
            For the _sole purpose_ of letting us manipulate KoBoCAT
            permissions, this comprises the following django-guardian classes
            all condensed into one:

              * UserObjectPermission
              * UserObjectPermissionBase
              * BaseGenericObjectPermission
              * BaseObjectPermission

            CAVEAT LECTOR: The django-guardian custom manager,
            UserObjectPermissionManager, is NOT included!
            '''
            permission = models.ForeignKey(Permission)
            content_type = models.ForeignKey(ContentType)
            object_pk = models.CharField(_('object ID'), max_length=255)
            content_object = GenericForeignKey(fk_field='object_pk')
            user = models.ForeignKey(
                getattr(settings, 'AUTH_USER_MODEL', 'auth.User'))

            class Meta:
                db_table = 'guardian_userobjectpermission'
                unique_together = ['user', 'permission', 'object_pk']
                verbose_name = 'user object permission'

            def __unicode__(self):
                # `unicode(self.content_object)` fails when the object's model
                # isn't known to this Django project. Let's use something more
                # benign instead.
                content_object_str = '{app_label}_{model} ({pk})'.format(
                    app_label=self.content_type.app_label,
                    model=self.content_type.model,
                    pk=self.object_pk)
                return '%s | %s | %s' % (
                    #unicode(self.content_object),
                    content_object_str,
                    unicode(getattr(self, 'user', False) or self.group),
                    unicode(self.permission.codename))

            def save(self, *args, **kwargs):
                content_type = ContentType.objects.get_for_model(
                    self.content_object)
                if content_type != self.permission.content_type:
                    raise ValidationError(
                        "Cannot persist permission not designed for this "
                        "class (permission's type is %r and object's type is "
                        "%r)"
                        % (self.permission.content_type, content_type)
                    )
                return super(UserObjectPermission, self).save(*args, **kwargs)


        self._XForm = _ReadOnlyXform
        self._Instance = _ReadOnlyInstance
        self._Attachment = _ReadOnlyAttachment
        self._UserProfile = _UserProfile
        self._UserObjectPermission = _UserObjectPermission

_models = LazyModelGroup()


def safe_kc_read(func):
    def _wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ProgrammingError as e:
            raise ProgrammingError('kc_access error accessing kobocat '
                                   'tables: {}'.format(e.message))
    return _wrapper

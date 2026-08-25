# 🔑 Social OS RBAC & Permissions Reference

| Permission Name | Description | Default Roles |
|---|---|---|
| `social.profile.read` | View user social profiles within institution | `STUDENT`, `FACULTY`, `HOD`, `COLLEGE_ADMIN` |
| `social.profile.update` | Update own bio, avatar, cover photo, interests | `STUDENT`, `FACULTY`, `HOD` |
| `social.post.create` | Publish social posts within college visibility scopes | `STUDENT`, `FACULTY`, `HOD` |
| `social.post.read` | Read eligible social feed posts | `STUDENT`, `FACULTY`, `HOD`, `COLLEGE_ADMIN` |
| `social.comment.create` | Add comments or threaded replies to posts | `STUDENT`, `FACULTY`, `HOD` |
| `social.like.create` | Like or unlike posts | `STUDENT`, `FACULTY`, `HOD` |
| `social.follow.create` | Follow or unfollow users | `STUDENT`, `FACULTY`, `HOD` |
| `social.community.create` | Create campus interest communities | `STUDENT`, `FACULTY`, `HOD` |
| `social.club.create` | Request creation of institution-recognized clubs | `STUDENT`, `FACULTY`, `HOD` |
| `social.club.manage` | Administrative approval of club registration requests | `COLLEGE_ADMIN` |
| `social.event.create` | Schedule campus events | `STUDENT`, `FACULTY`, `HOD`, `COLLEGE_ADMIN` |
| `social.message.create` | Send direct messages (enforces block rules) | `STUDENT`, `FACULTY`, `HOD` |
| `social.report.create` | File content or user safety reports | `STUDENT`, `FACULTY`, `HOD` |
| `social.moderation.review` | Access safety queue & execute audit-logged moderation actions | `COLLEGE_ADMIN`, `PLATFORM_ADMIN` |

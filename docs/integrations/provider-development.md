# 🛠️ ERP Provider Adapter Development Guide

## Implementing a Custom ERP Adapter
To add support for a new ERP vendor (e.g. `VendorAAdapter`), create a class implementing the `IntegrationAdapter` interface:

```typescript
import { IntegrationAdapter, AdapterCapabilities } from './integration-adapter.interface';

export class VendorAAdapter implements IntegrationAdapter {
  readonly providerId = 'vendor-a-uuid';

  getCapabilities(): AdapterCapabilities {
    return {
      students: true,
      faculty: true,
      departments: true,
      programs: true,
      courses: true,
      subjects: true,
      sections: true,
      academicPeriods: true,
      timetable: true,
      attendance: true,
      exams: true,
      results: true,
    };
  }

  // Implement capability fetch methods...
}
```

No changes to `SyncEngine`, RBAC guards, or core domain models are required when adding new vendor adapters.

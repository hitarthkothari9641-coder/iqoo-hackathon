# 📱 Android Architecture

## Tech Stack
- **Language**: Kotlin 2.0 (JVM 17 Target)
- **UI Framework**: Jetpack Compose (Material 3 - Editorial Campus Theme)
- **Architecture**: MVVM + Clean Architecture (Data, Domain, Feature layers)
- **Dependency Injection**: Hilt / ServiceLocator
- **Network**: Retrofit 2 + OkHttp 4 (`RequestIdInterceptor`, `AuthInterceptor`)
- **Persistence**: Room Database + DataStore Preferences

## Package Architecture (`com.collegeos`)
```
com.collegeos/
├── CollegeOsApplication.kt
├── MainActivity.kt
├── core/
│   ├── common/       # Result, Constants
│   ├── network/      # ApiClient, ApiService, NetworkResult, Interceptors
│   ├── database/     # Room DB foundation
│   ├── datastore/    # DataStore Preferences
│   └── ui/theme/     # Color, Type, Theme, Dimens, Shape
├── data/             # Repositories & Remote/Local data sources
├── domain/           # Use cases & Domain models
└── feature/          # UI Feature screens (auth, home, campus, learn, career, profile)
```

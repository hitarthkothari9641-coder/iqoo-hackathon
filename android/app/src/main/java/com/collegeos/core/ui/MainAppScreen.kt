package com.collegeos.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.collegeos.core.common.Constants
import com.collegeos.feature.academics.AcademicsViewModel
import com.collegeos.feature.academics.ui.AcademicsScreen
import com.collegeos.feature.social.SocialViewModel
import com.collegeos.feature.social.ui.SocialScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    val academicsViewModel = remember { AcademicsViewModel() }
    val socialViewModel = remember { SocialViewModel() }

    val academicsState = academicsViewModel.uiState.value
    val socialState = socialViewModel.uiState.value

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = Constants.APP_NAME,
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = Constants.APP_TAGLINE,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    label = { Text("Home") },
                    icon = { Text("🏠") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("Academics") },
                    icon = { Text("📚") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("Social") },
                    icon = { Text("💬") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Clubs") },
                    icon = { Text("🏛️") }
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    label = { Text("Profile") },
                    icon = { Text("👤") }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> UnifiedDashboardScreen(
                    onNavigateToAcademics = { selectedTab = 1 },
                    onNavigateToSocial = { selectedTab = 2 }
                )
                1 -> AcademicsScreen(state = academicsState)
                2 -> SocialScreen(state = socialState)
                3 -> CommunitiesAndClubsScreen()
                4 -> ProfileAndSettingsScreen()
            }
        }
    }
}

@Composable
fun UnifiedDashboardScreen(
    onNavigateToAcademics: () -> Unit,
    onNavigateToSocial: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .height(10.dp)
                                .width(10.dp)
                                .background(Color(0xFF22C55E), shape = RoundedCornerShape(5.dp))
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Connected to Campus ERP",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Good morning! You are enrolled in Semester 3 (2026–2027). All academic records and campus updates are synchronized.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        item {
            Text(
                text = "Next Class & Today's Schedule",
                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold)
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("CS301 • Data Structures & Algorithms", fontWeight = FontWeight.Bold)
                    Text("Time: 09:00 AM - 10:00 AM | Room: Lab 2 | Dr. XYZ")
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = onNavigateToAcademics) {
                        Text("View Full Timetable & Attendance")
                    }
                }
            }
        }

        item {
            Text(
                text = "Quick Access Modules",
                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold)
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAcademics
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📊 Attendance", fontWeight = FontWeight.Bold)
                            Text("90.8% Overall")
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAcademics
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📝 Assignments", fontWeight = FontWeight.Bold)
                            Text("1 Due Tomorrow")
                        }
                    }
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToSocial
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("💬 Campus Social", fontWeight = FontWeight.Bold)
                            Text("Trending Posts & Updates")
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAcademics
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📖 Study Planner", fontWeight = FontWeight.Bold)
                            Text("2 Study Tasks")
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "Recent Campus Announcements",
                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold)
            )
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("🚀 TechFest 2026 Hackathon Registration Open", fontWeight = FontWeight.Bold)
                    Text("Published by Department of Computer Science • 2 hours ago")
                }
            }
        }
    }
}

@Composable
fun CommunitiesAndClubsScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Campus Communities & Verified Clubs",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Join interest groups and official college clubs.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        item {
            Text("Featured Clubs", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Official Coding Club ✓", fontWeight = FontWeight.Bold)
                    Text("Competitive programming, hackathons, and open source projects.")
                    Text("210 Active Members • Faculty Advisor: Dr. ABC")
                }
            }
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Model United Nations (MUN) ✓", fontWeight = FontWeight.Bold)
                    Text("Global policy, diplomacy, and inter-college debate competitions.")
                    Text("95 Active Members")
                }
            }
        }

        item {
            Text("Campus Communities", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("AI & Machine Learning Group", fontWeight = FontWeight.Bold)
                    Text("Discussion on LLMs, computer vision, and neural network research.")
                    Text("142 Members")
                }
            }
        }
    }
}

@Composable
fun ProfileAndSettingsScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "My Identity & Account",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Alex Chen", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
                    Text("Student ID: 2024CS108 • Verified Student ✓", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Department: Department of Computer Science")
                    Text("Program: B.Tech Computer Science & Engineering")
                    Text("Current Year: 2nd Year (Semester 3)")
                    Text("Institutional Email: alex.chen@campus.edu")
                }
            }
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("ERP Connection Status", fontWeight = FontWeight.Bold)
                    Text("Status: CONNECTED (Mock ERP Provider)", color = MaterialTheme.colorScheme.primary)
                    Text("Last Synced: Today @ 23:00")
                }
            }
        }
    }
}

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
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
                    icon = { Icon(Icons.Filled.Home, contentDescription = "Home") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("Academics") },
                    icon = { Icon(Icons.Filled.School, contentDescription = "Academics") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("Social") },
                    icon = { Icon(Icons.Filled.Forum, contentDescription = "Social") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Clubs") },
                    icon = { Icon(Icons.Filled.Groups, contentDescription = "Clubs") }
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    label = { Text("Profile") },
                    icon = { Icon(Icons.Filled.Person, contentDescription = "Profile") }
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
                3 -> CommunitiesAndClubsScreen(socialState)
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
                        text = "Welcome back, Alex Chen! You are enrolled in B.Tech Computer Science (Sem 3 • 2026–2027). All attendance, marks, and timetables are synchronized.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        item {
            Text(
                text = "Today's Class Schedule (4 Classes)",
                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold)
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("NOW: CS301 • Data Structures & Algorithms", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text("Time: 09:00 AM - 10:00 AM | Room: CS Lab 2 | Dr. Rajesh Kumar")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("NEXT: CS302 • Database Management Systems (10:15 AM @ LH 104)")
                    Text("THEN: MA301 • Linear Algebra (11:30 AM @ LH 201)")
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = onNavigateToAcademics) {
                        Text("View Full Weekly Timetable & Rooms")
                    }
                }
            }
        }

        item {
            Text(
                text = "Academic & Attendance Overview",
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
                            Text("90.8% Overall", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            Text("Safe (+3 classes margin)", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAcademics
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📝 Assignments", fontWeight = FontWeight.Bold)
                            Text("2 Pending", color = Color(0xFFEAB308), fontWeight = FontWeight.Bold)
                            Text("B-Tree Due Tomorrow", style = MaterialTheme.typography.labelSmall)
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
                            Text("4 New Updates", fontWeight = FontWeight.Bold)
                            Text("TechFest 2026 Open", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAcademics
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📖 Study Planner", fontWeight = FontWeight.Bold)
                            Text("3 Tasks Remaining", fontWeight = FontWeight.Bold)
                            Text("AVL Trees High Priority", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "Upcoming Midterm Examinations",
                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold)
            )
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("CS301 Data Structures & Algorithms Midterm", fontWeight = FontWeight.Bold)
                    Text("Date: Oct 12, 2026 @ 10:00 AM | Hall: Exam Center 1 | Max Marks: 100")
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("CS302 Database Management Systems Midterm", fontWeight = FontWeight.Bold)
                    Text("Date: Oct 14, 2026 @ 02:00 PM | Hall: Exam Center 2 | Max Marks: 100")
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
                    Text("Build AI & IoT solutions for smart campus mobility. ₹1,00,000 cash prizes!")
                }
            }
        }
    }
}

@Composable
fun CommunitiesAndClubsScreen(socialState: com.collegeos.feature.social.SocialState) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Verified Clubs & Campus Communities",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Official institution-recognized student clubs and active interest groups.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        item {
            Text("Verified Institution Clubs (${socialState.clubs.size})", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }

        items(socialState.clubs) { club ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(club.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.weight(1f))
                        Text("✓ Approved", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                    }
                    Text("Category: ${club.category} | ${club.membersCount} Active Members", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(club.description)
                    Text("Faculty Advisor: ${club.facultyAdvisor}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.tertiary)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(onClick = {}) {
                        Text("View Club Portal & Events")
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text("Campus Interest Communities (${socialState.communities.size})", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }

        items(socialState.communities) { comm ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(comm.name, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.weight(1f))
                        if (comm.isJoined) {
                            Text("Joined ✓", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                        }
                    }
                    Text(comm.description)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${comm.membersCount} Members • ${comm.category}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
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
                    Text("Student USN: 2024CS108 • Verified Student ✓", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Department: Department of Computer Science & Engineering")
                    Text("Program: B.Tech Computer Science & Engineering")
                    Text("Current Academic Year: 2nd Year (Semester 3)")
                    Text("Cumulative GPA (CGPA): 8.92 / 10.0")
                    Text("Earned Credits: 64 / 160 Credits")
                    Text("Institutional Email: alex.chen@campus.edu")
                }
            }
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Campus ERP Integration Status", fontWeight = FontWeight.Bold)
                    Text("Provider: Mock ERP Provider v2.1", color = MaterialTheme.colorScheme.onSurface)
                    Text("Status: CONNECTED & SYNCED", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Text("Last Incremental Sync: Today @ 23:25")
                    Text("Circuit Breaker Status: CLOSED (Healthy 100%)", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                }
            }
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Security & Privacy Settings", fontWeight = FontWeight.Bold)
                    Text("Social Visibility: COLLEGE (Campus Scoped)")
                    Text("Token Refresh Engine: SHA-256 Rotation Active")
                    Text("Multi-Factor Authentication: Enabled")
                }
            }
        }
    }
}

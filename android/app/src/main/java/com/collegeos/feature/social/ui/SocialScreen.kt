package com.collegeos.feature.social.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.collegeos.feature.social.SocialState

@Composable
fun SocialScreen(
    state: SocialState
) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("Feed", "Communities", "Clubs", "Discover")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "College Community",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )

        Text(
            text = "Private Campus Social OS • Multi-Level Visibility Scopes",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.secondary
        )

        Spacer(modifier = Modifier.height(12.dp))

        ScrollableTabRow(selectedTabIndex = selectedTabIndex, edgePadding = 0.dp) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = { selectedTabIndex = index },
                    text = { Text(title) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (selectedTabIndex) {
            0 -> FeedList(state.feedPosts)
            1 -> CommunityList(state.communities)
            2 -> ClubList(state.clubs)
            3 -> DiscoverList()
        }
    }
}

@Composable
fun FeedList(items: List<com.collegeos.feature.social.PostUiItem>) {
    LazyColumn {
        items(items) { post ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text(post.authorName, fontWeight = FontWeight.Bold)
                            Text("${post.authorHandle} • ${post.authorRoleBadge}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                        }
                        Spacer(modifier = Modifier.weight(1f))
                        Text(post.timeAgoText, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.tertiary)
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(post.content, style = MaterialTheme.typography.bodyMedium)

                    if (post.tag != null) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Category: ${post.tag}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(if (post.isLiked) "❤️ ${post.likesCount} Liked" else "🤍 ${post.likesCount} Like")
                        Spacer(modifier = Modifier.padding(horizontal = 12.dp))
                        Text("💬 ${post.commentsCount} Comments")
                        Spacer(modifier = Modifier.weight(1f))
                        Text("Scope: ${post.visibility}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                    }
                }
            }
        }
    }
}

@Composable
fun CommunityList(items: List<com.collegeos.feature.social.CommunityUiItem>) {
    LazyColumn {
        items(items) { comm ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(comm.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.weight(1f))
                        if (comm.isJoined) {
                            Text("Joined ✓", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text(comm.description)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${comm.membersCount} Active Members • ${comm.category}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                }
            }
        }
    }
}

@Composable
fun ClubList(items: List<com.collegeos.feature.social.ClubUiItem>) {
    LazyColumn {
        items(items) { club ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(club.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.weight(1f))
                        if (club.isApproved) {
                            Text("✓ Verified Club", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text("Category: ${club.category} • ${club.membersCount} Members")
                    Text("Faculty Advisor: ${club.facultyAdvisor}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.tertiary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(club.description, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
fun DiscoverList() {
    LazyColumn {
        item {
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Campus User Discovery", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    Text("Discover verified students, faculty members, and researchers within your college tenant.")
                }
            }
        }
        item {
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Dr. Rajesh Kumar", fontWeight = FontWeight.Bold)
                    Text("Professor & HOD • Department of Computer Science & Engineering")
                    Text("Interests: Machine Learning, Data Structures, Distributed Systems")
                }
            }
        }
        item {
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Priya Sharma", fontWeight = FontWeight.Bold)
                    Text("Student • Electronics & Communication Engineering (Sem 5)")
                    Text("Interests: IoT, Robotics, Signal Processing, Photography")
                }
            }
        }
    }
}

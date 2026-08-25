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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
            text = "Private Campus Social OS",
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
            3 -> DiscoverPlaceholder()
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
                    Row {
                        Text(post.authorName, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.padding(horizontal = 4.dp))
                        Text(post.authorHandle, color = MaterialTheme.colorScheme.secondary)
                        Spacer(modifier = Modifier.weight(1f))
                        Text(post.timeAgoText, style = MaterialTheme.typography.bodySmall)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(post.content)
                    Spacer(modifier = Modifier.height(12.dp))
                    Row {
                        Text("❤️ ${post.likesCount}")
                        Spacer(modifier = Modifier.padding(horizontal = 8.dp))
                        Text("💬 ${post.commentsCount}")
                        Spacer(modifier = Modifier.weight(1f))
                        Text("Scope: ${post.visibility}", style = MaterialTheme.typography.bodySmall)
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
                    Text(comm.name, fontWeight = FontWeight.Bold)
                    Text(comm.description)
                    Text("${comm.membersCount} Members • ${comm.category}", style = MaterialTheme.typography.bodySmall)
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
                    Row {
                        Text(club.name, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.weight(1f))
                        if (club.isApproved) {
                            Text("✓ Verified Club", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text("Category: ${club.category} | ${club.membersCount} Members")
                }
            }
        }
    }
}

@Composable
fun DiscoverPlaceholder() {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Campus Discovery", fontWeight = FontWeight.Bold)
            Text("Search students by program, department, and interests within your college.")
        }
    }
}

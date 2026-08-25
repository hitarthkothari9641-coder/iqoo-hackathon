package com.collegeos.feature.social

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PostUiItem(
    val id: String,
    val authorName: String,
    val authorHandle: String,
    val timeAgoText: String,
    val content: String,
    val likesCount: Int,
    val commentsCount: Int,
    val isLiked: Boolean,
    val visibility: String
)

data class CommunityUiItem(
    val id: String,
    val name: String,
    val description: String,
    val membersCount: Int,
    val category: String
)

data class ClubUiItem(
    val id: String,
    val name: String,
    val category: String,
    val membersCount: Int,
    val isApproved: Boolean
)

data class SocialState(
    val isLoading: Boolean = false,
    val feedPosts: List<PostUiItem> = emptyList(),
    val communities: List<CommunityUiItem> = emptyList(),
    val clubs: List<ClubUiItem> = emptyList(),
    val activeTab: String = "Feed"
)

class SocialViewModel : ViewModel() {

    private val samplePosts = listOf(
        PostUiItem("post-1", "Alex Chen", "@alex_cs", "2 hours ago", "Hackathon registration for TechFest 2026 is officially OPEN! Build solutions for sustainable campus living. 🚀", 18, 4, false, "COLLEGE"),
        PostUiItem("post-2", "Coding Club", "@coding_club", "4 hours ago", "Weekly Algorithm Meetup today at 5:00 PM in Lab 3. We'll be solving Graph Shortest Path problems!", 34, 9, true, "COLLEGE")
    )

    private val sampleCommunities = listOf(
        CommunityUiItem("comm-1", "AI & Machine Learning", "Community for students passionate about LLMs, computer vision, and Neural Networks.", 142, "Technology"),
        CommunityUiItem("comm-2", "Campus Photography", "Sharing urban and campus architecture snapshots.", 88, "Arts")
    )

    private val sampleClubs = listOf(
        ClubUiItem("club-1", "Official Coding Club", "Technology & Competitive Programming", 210, true),
        ClubUiItem("club-2", "Model United Nations", "Debate & Global Policy", 95, true)
    )

    private val _uiState = MutableStateFlow(
        SocialState(
            isLoading = false,
            feedPosts = samplePosts,
            communities = sampleCommunities,
            clubs = sampleClubs
        )
    )
    val uiState: StateFlow<SocialState> = _uiState.asStateFlow()

    fun loadSocialData() {
        viewModelScope.launch {
            _uiState.value = SocialState(
                isLoading = false,
                feedPosts = samplePosts,
                communities = sampleCommunities,
                clubs = sampleClubs
            )
        }
    }
}

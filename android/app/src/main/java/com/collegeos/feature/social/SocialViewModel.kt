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
    val authorRoleBadge: String,
    val timeAgoText: String,
    val content: String,
    val likesCount: Int,
    val commentsCount: Int,
    val isLiked: Boolean,
    val visibility: String,
    val tag: String? = null
)

data class CommunityUiItem(
    val id: String,
    val name: String,
    val description: String,
    val membersCount: Int,
    val category: String,
    val isJoined: Boolean = false
)

data class ClubUiItem(
    val id: String,
    val name: String,
    val category: String,
    val membersCount: Int,
    val isApproved: Boolean,
    val facultyAdvisor: String,
    val description: String
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
        PostUiItem(
            id = "post-1",
            authorName = "Alex Chen",
            authorHandle = "@alex_cs",
            authorRoleBadge = "Student • CSE 2nd Yr",
            timeAgoText = "2 hours ago",
            content = "Hackathon registration for TechFest 2026 is officially OPEN! Build AI solutions for campus sustainability and smart mobility. 🚀 Free hosting credits & ₹1,00,000 prize pool!",
            likesCount = 42,
            commentsCount = 12,
            isLiked = true,
            visibility = "COLLEGE",
            tag = "Announcement"
        ),
        PostUiItem(
            id = "post-2",
            authorName = "Official Coding Club",
            authorHandle = "@coding_club",
            authorRoleBadge = "Verified Club ✓",
            timeAgoText = "4 hours ago",
            content = "Weekly Competitive Programming Meetup today @ 05:00 PM in CS Lab 3. We will solve Graph Shortest Path & Dynamic Programming problems. Beginners welcome!",
            likesCount = 68,
            commentsCount = 19,
            isLiked = false,
            visibility = "COLLEGE",
            tag = "Event"
        ),
        PostUiItem(
            id = "post-3",
            authorName = "Dr. Rajesh Kumar",
            authorHandle = "@rajesh_cs",
            authorRoleBadge = "Faculty • CSE Dept",
            timeAgoText = "6 hours ago",
            content = "Reminder for CS301 Section B: Data Structures Assignment 2 (B-Trees) deadline is extended to tomorrow 11:59 PM. Make sure to attach your runtime analysis graphs.",
            likesCount = 89,
            commentsCount = 7,
            isLiked = false,
            visibility = "SECTION",
            tag = "Academic Notice"
        ),
        PostUiItem(
            id = "post-4",
            authorName = "Priya Sharma",
            authorHandle = "@priya_photo",
            authorRoleBadge = "Student • ECE 3rd Yr",
            timeAgoText = "1 day ago",
            content = "Golden hour vibes at the Central Library quad. 📸 Excited to share campus snapshots from yesterday's sunset photoshoot!",
            likesCount = 115,
            commentsCount = 24,
            isLiked = true,
            visibility = "COLLEGE",
            tag = "Creative"
        )
    )

    private val sampleCommunities = listOf(
        CommunityUiItem("comm-1", "AI & Machine Learning Group", "Discussing Large Language Models, Computer Vision, and PyTorch research papers.", 142, "Technology", true),
        CommunityUiItem("comm-2", "Competitive Programming Hub", "Daily LeetCode & Codeforces problem discussions and contest solutions.", 198, "Academic", true),
        CommunityUiItem("comm-3", "Open Source Developers", "Building open source campus software and contributing to Linux foundation projects.", 110, "Technology", false),
        CommunityUiItem("comm-4", "Campus Photography Guild", "Sharing urban, nature, and campus architecture snapshots.", 88, "Arts & Culture", false)
    )

    private val sampleClubs = listOf(
        ClubUiItem("club-1", "Official Coding Club", "Technology & Programming", 210, true, "Dr. Rajesh Kumar", "Fostering competitive programming, hackathons, and open source development across campus."),
        ClubUiItem("club-2", "Robotics & Automation Society", "Engineering & Hardware", 165, true, "Prof. Anita Sharma", "Designing autonomous rovers, IoT sensors, and participating in national robotics competitions."),
        ClubUiItem("club-3", "Model United Nations (MUN)", "Debate & Global Policy", 95, true, "Dr. Vikram Rao", "Inter-college debate, diplomacy, public speaking, and geopolitical simulations."),
        ClubUiItem("club-4", "Music & Cultural Society", "Arts & Performing Arts", 180, true, "Prof. Sunita Menon", "Campus band jams, annual cultural fest performances, and acoustic nights."),
        ClubUiItem("club-5", "Entrepreneurship & Startup Cell", "Innovation & Business", 130, true, "Dr. Subodh Verma", "Incubating student startup ideas, pitch decks, and angel investor networking sessions.")
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

package com.collegeos

import com.collegeos.feature.social.SocialViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SocialViewModelTest {

    @Test
    fun `loadSocialData populates feed, communities, and clubs`() {
        val viewModel = SocialViewModel()
        viewModel.loadSocialData()

        val state = viewModel.uiState.value
        assertEquals(2, state.feedPosts.size)
        assertEquals(2, state.communities.size)
        assertEquals(2, state.clubs.size)
        assertTrue(state.clubs.all { it.isApproved })
    }
}

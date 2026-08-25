package com.collegeos

import com.collegeos.feature.academics.AcademicsViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AcademicsViewModelTest {

    @Test
    fun `loadAcademicsData populates state with synced ERP records`() {
        val viewModel = AcademicsViewModel()
        viewModel.loadAcademicsData()

        val state = viewModel.uiState.value
        assertEquals(4, state.timetable.size)
        assertEquals(5, state.attendance.size)
        assertEquals(3, state.exams.size)
        assertEquals(4, state.results.size)
        assertTrue(state.lastUpdatedText.contains("Synced"))
    }
}

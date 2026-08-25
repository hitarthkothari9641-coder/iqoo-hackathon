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
        assertEquals(2, state.timetable.size)
        assertEquals(2, state.attendance.size)
        assertEquals(1, state.exams.size)
        assertEquals(1, state.results.size)
        assertTrue(state.lastUpdatedText.contains("Synced"))
    }
}

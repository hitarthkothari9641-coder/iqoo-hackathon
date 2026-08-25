package com.collegeos.feature.academics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TimetableItem(
    val id: String,
    val subjectCode: String,
    val subjectName: String,
    val dayOfWeek: Int,
    val startTime: String,
    val endTime: String,
    val room: String?
)

data class AttendanceSummaryItem(
    val subjectCode: String,
    val subjectName: String,
    val totalClasses: Int,
    val attendedClasses: Int,
    val percentage: Float
)

data class ExamScheduleItem(
    val examName: String,
    val subjectCode: String,
    val subjectName: String,
    val date: String,
    val time: String,
    val room: String?
)

data class ResultItem(
    val examName: String,
    val subjectCode: String,
    val subjectName: String,
    val marks: Double,
    val maxMarks: Double,
    val grade: String?
)

data class AssignmentUiItem(
    val id: String,
    val title: String,
    val subjectCode: String,
    val dueAtText: String,
    val maxMarks: Double,
    val isSubmitted: Boolean
)

data class StudyTaskUiItem(
    val id: String,
    val title: String,
    val priority: String,
    val isCompleted: Boolean
)

data class NoteUiItem(
    val id: String,
    val title: String,
    val content: String,
    val updatedAtText: String
)

data class AcademicsState(
    val isLoading: Boolean = false,
    val timetable: List<TimetableItem> = emptyList(),
    val attendance: List<AttendanceSummaryItem> = emptyList(),
    val exams: List<ExamScheduleItem> = emptyList(),
    val results: List<ResultItem> = emptyList(),
    val assignments: List<AssignmentUiItem> = emptyList(),
    val studyTasks: List<StudyTaskUiItem> = emptyList(),
    val notes: List<NoteUiItem> = emptyList(),
    val attendanceWarningText: String? = null,
    val lastUpdatedText: String = "Live",
    val errorMessage: String? = null
)

class AcademicsViewModel : ViewModel() {

    private val sampleTimetable = listOf(
        TimetableItem("tt-1", "CS301", "Data Structures & Algorithms", 1, "09:00", "10:00", "Lab 2"),
        TimetableItem("tt-2", "CS302", "Database Management Systems", 1, "10:15", "11:15", "Hall 101")
    )

    private val sampleAttendance = listOf(
        AttendanceSummaryItem("CS301", "Data Structures & Algorithms", 24, 22, 91.6f),
        AttendanceSummaryItem("CS302", "Database Management Systems", 20, 18, 90.0f)
    )

    private val sampleExams = listOf(
        ExamScheduleItem("Midterm Exams", "CS301", "Data Structures", "2026-09-16", "10:00 - 12:00", "Hall 101")
    )

    private val sampleResults = listOf(
        ResultItem("Midterm Exams", "CS301", "Data Structures", 88.5, 100.0, "A")
    )

    private val sampleAssignments = listOf(
        AssignmentUiItem("asg-1", "B-Tree Implementation Assignment", "CS301", "Due tomorrow @ 11:59 PM", 100.0, false),
        AssignmentUiItem("asg-2", "Relational Algebra Problem Set", "CS302", "Submitted 2 days ago", 50.0, true)
    )

    private val sampleStudyTasks = listOf(
        StudyTaskUiItem("task-1", "Revise AVL Tree Rotations", "HIGH", false),
        StudyTaskUiItem("task-2", "Practice SQL Joins", "MEDIUM", true)
    )

    private val sampleNotes = listOf(
        NoteUiItem("note-1", "Database Indexing Quick Sheet", "B+ Trees hold keys only in leaf nodes with linked pointers.", "Today")
    )

    private val _uiState = MutableStateFlow(
        AcademicsState(
            isLoading = false,
            timetable = sampleTimetable,
            attendance = sampleAttendance,
            exams = sampleExams,
            results = sampleResults,
            assignments = sampleAssignments,
            studyTasks = sampleStudyTasks,
            notes = sampleNotes,
            lastUpdatedText = "Synced 5 mins ago"
        )
    )
    val uiState: StateFlow<AcademicsState> = _uiState.asStateFlow()

    fun loadAcademicsData() {
        viewModelScope.launch {
            _uiState.value = AcademicsState(
                isLoading = false,
                timetable = sampleTimetable,
                attendance = sampleAttendance,
                exams = sampleExams,
                results = sampleResults,
                assignments = sampleAssignments,
                studyTasks = sampleStudyTasks,
                notes = sampleNotes,
                lastUpdatedText = "Synced 5 mins ago"
            )
        }
    }
}

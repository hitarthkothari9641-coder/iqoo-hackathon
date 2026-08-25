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
    val room: String?,
    val facultyName: String
)

data class AttendanceSummaryItem(
    val subjectCode: String,
    val subjectName: String,
    val totalClasses: Int,
    val attendedClasses: Int,
    val percentage: Float,
    val statusText: String
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
    val isSubmitted: Boolean,
    val description: String
)

data class StudyTaskUiItem(
    val id: String,
    val title: String,
    val subjectCode: String,
    val priority: String,
    val estimatedMins: Int,
    val isCompleted: Boolean
)

data class NoteUiItem(
    val id: String,
    val title: String,
    val subjectCode: String,
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
    val overallAttendancePct: Float = 90.8f,
    val safeToMissClasses: Int = 3,
    val lastUpdatedText: String = "Synced 5 mins ago",
    val errorMessage: String? = null
)

class AcademicsViewModel : ViewModel() {

    private val sampleTimetable = listOf(
        TimetableItem("tt-1", "CS301", "Data Structures & Algorithms", 1, "09:00 AM", "10:00 AM", "Lab 2", "Dr. Rajesh Kumar"),
        TimetableItem("tt-2", "CS302", "Database Management Systems", 1, "10:15 AM", "11:15 AM", "LH 104", "Prof. Anita Sharma"),
        TimetableItem("tt-3", "MA301", "Linear Algebra & Discrete Math", 1, "11:30 AM", "12:30 PM", "LH 201", "Dr. Vikram Rao"),
        TimetableItem("tt-4", "CS301L", "Data Structures Lab", 1, "02:00 PM", "04:00 PM", "CS Lab 3", "T.A. Rahul Verma")
    )

    private val sampleAttendance = listOf(
        AttendanceSummaryItem("CS301", "Data Structures & Algorithms", 24, 22, 91.6f, "Safe (+2 classes margin)"),
        AttendanceSummaryItem("CS302", "Database Management Systems", 20, 18, 90.0f, "Safe (+1 class margin)"),
        AttendanceSummaryItem("MA301", "Linear Algebra & Discrete Math", 22, 19, 86.3f, "Borderline (Need 2 more)"),
        AttendanceSummaryItem("EC304", "Digital Electronics & Logic Design", 18, 17, 94.4f, "Excellent (+3 classes margin)"),
        AttendanceSummaryItem("CS301L", "Data Structures Lab", 10, 10, 100.0f, "Perfect 100%")
    )

    private val sampleExams = listOf(
        ExamScheduleItem("Midterm Exams", "CS301", "Data Structures & Algorithms", "Oct 12, 2026", "10:00 AM - 12:00 PM", "Exam Hall 1"),
        ExamScheduleItem("Midterm Exams", "CS302", "Database Management Systems", "Oct 14, 2026", "02:00 PM - 04:00 PM", "Exam Hall 2"),
        ExamScheduleItem("Midterm Exams", "MA301", "Linear Algebra & Discrete Math", "Oct 16, 2026", "10:00 AM - 12:00 PM", "Exam Hall 1")
    )

    private val sampleResults = listOf(
        ResultItem("Internal Assessment 1", "CS301", "Data Structures & Algorithms", 46.5, 50.0, "A+"),
        ResultItem("Internal Assessment 1", "CS302", "Database Management Systems", 44.0, 50.0, "A"),
        ResultItem("Internal Assessment 1", "MA301", "Linear Algebra & Discrete Math", 42.0, 50.0, "A"),
        ResultItem("Lab Practical 1", "CS301L", "Data Structures Lab", 25.0, 25.0, "O")
    )

    private val sampleAssignments = listOf(
        AssignmentUiItem("asg-1", "B-Tree & Red-Black Tree Implementation", "CS301", "Due Tomorrow @ 11:59 PM", 100.0, false, "Implement B-Tree insertion, deletion, and node splitting in C++ with test cases."),
        AssignmentUiItem("asg-2", "ER Diagram & Schema Normalization 3NF/BCNF", "CS302", "Due Friday @ 05:00 PM", 50.0, false, "Design normalized Relational Schema for University Library Management."),
        AssignmentUiItem("asg-3", "Eigenvalues & Vector Space Proofs", "MA301", "Submitted Oct 20", 50.0, true, "Problem Set 4: Vector spaces, linear transformations, and diagonalization."),
        AssignmentUiItem("asg-4", "Sequential Logic Circuit Simulation", "EC304", "Submitted Oct 18", 30.0, true, "Design 4-bit Synchronous Counter in Logisim.")
    )

    private val sampleStudyTasks = listOf(
        StudyTaskUiItem("task-1", "Revise AVL Tree Rotations & Heights", "CS301", "HIGH", 45, false),
        StudyTaskUiItem("task-2", "Practice SQL Group By & Having Queries", "CS302", "HIGH", 30, false),
        StudyTaskUiItem("task-3", "Solve Matrix Diagonalization Examples", "MA301", "MEDIUM", 60, false),
        StudyTaskUiItem("task-4", "Review Flip-Flop Truth Tables", "EC304", "LOW", 20, true)
    )

    private val sampleNotes = listOf(
        NoteUiItem("note-1", "Database Indexing & B+ Trees Summary", "CS302", "B+ Trees maintain all key-pointer pairs in leaf nodes connected via doubly linked list, reducing disk I/O.", "Today @ 09:30 AM"),
        NoteUiItem("note-2", "Dijkstra vs Bellman-Ford Shortest Path", "CS301", "Dijkstra works with non-negative edge weights O((V+E) log V). Bellman-Ford handles negative weights O(VE).", "Yesterday"),
        NoteUiItem("note-3", "Linear Transformation Kernel & Image", "MA301", "Rank-Nullity Theorem: dim(V) = dim(Ker T) + dim(Im T).", "Oct 21")
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
            overallAttendancePct = 90.8f,
            safeToMissClasses = 3,
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
                overallAttendancePct = 90.8f,
                safeToMissClasses = 3,
                lastUpdatedText = "Synced 5 mins ago"
            )
        }
    }
}

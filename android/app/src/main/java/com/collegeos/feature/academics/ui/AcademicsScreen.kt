package com.collegeos.feature.academics.ui

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
import com.collegeos.feature.academics.AcademicsState

@Composable
fun AcademicsScreen(
    state: AcademicsState
) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("Dashboard", "Attendance", "Timetable", "Assignments", "Planner", "Exams", "Results", "Notes")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Academic Operating System",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )

        Text(
            text = "Data Freshness: ${state.lastUpdatedText}",
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
            0 -> AcademicDashboardView(state)
            1 -> AttendanceList(state.attendance)
            2 -> TimetableList(state.timetable)
            3 -> AssignmentList(state.assignments)
            4 -> StudyTaskList(state.studyTasks)
            5 -> ExamList(state.exams)
            6 -> ResultList(state.results)
            7 -> NoteList(state.notes)
        }
    }
}

@Composable
fun AcademicDashboardView(state: AcademicsState) {
    LazyColumn {
        item {
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Current Semester: Semester 3 (2026-2027)", fontWeight = FontWeight.Bold)
                    Text("Credits Completed: 94 / 160 Required")
                    Text("Overall Attendance: 90.8%")
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
        item {
            Text("Upcoming Assignments", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }
        items(state.assignments) { asg ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(asg.title, fontWeight = FontWeight.Bold)
                    Text("${asg.subjectCode} • ${asg.dueAtText}")
                }
            }
        }
    }
}

@Composable
fun AttendanceList(items: List<com.collegeos.feature.academics.AttendanceSummaryItem>) {
    LazyColumn {
        items(items) { att ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Row(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = att.subjectName, fontWeight = FontWeight.Bold)
                        Text(text = "Code: ${att.subjectCode} | Attended: ${att.attendedClasses}/${att.totalClasses}")
                    }
                    Text(
                        text = "${att.percentage}%",
                        fontWeight = FontWeight.Bold,
                        color = if (att.percentage >= 75f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
fun TimetableList(items: List<com.collegeos.feature.academics.TimetableItem>) {
    LazyColumn {
        items(items) { tt ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = tt.subjectName, fontWeight = FontWeight.Bold)
                    Text(text = "Time: ${tt.startTime} - ${tt.endTime} | Room: ${tt.room ?: "TBA"}")
                }
            }
        }
    }
}

@Composable
fun AssignmentList(items: List<com.collegeos.feature.academics.AssignmentUiItem>) {
    LazyColumn {
        items(items) { asg ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = asg.title, fontWeight = FontWeight.Bold)
                    Text(text = "${asg.subjectCode} • ${asg.dueAtText}")
                    Text(
                        text = if (asg.isSubmitted) "✓ Submitted" else "Pending Submission",
                        color = if (asg.isSubmitted) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
fun StudyTaskList(items: List<com.collegeos.feature.academics.StudyTaskUiItem>) {
    LazyColumn {
        items(items) { task ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Row(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = task.title, fontWeight = FontWeight.Bold)
                        Text(text = "Priority: ${task.priority}")
                    }
                    Text(text = if (task.isCompleted) "Done" else "To Do")
                }
            }
        }
    }
}

@Composable
fun ExamList(items: List<com.collegeos.feature.academics.ExamScheduleItem>) {
    LazyColumn {
        items(items) { ex ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = ex.examName, fontWeight = FontWeight.Bold)
                    Text(text = "${ex.subjectName} (${ex.subjectCode})")
                    Text(text = "Date: ${ex.date} @ ${ex.time}")
                }
            }
        }
    }
}

@Composable
fun ResultList(items: List<com.collegeos.feature.academics.ResultItem>) {
    LazyColumn {
        items(items) { res ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Row(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = res.subjectName, fontWeight = FontWeight.Bold)
                        Text(text = "Exam: ${res.examName}")
                    }
                    Text(
                        text = "${res.marks}/${res.maxMarks} (${res.grade ?: "-"})",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun NoteList(items: List<com.collegeos.feature.academics.NoteUiItem>) {
    LazyColumn {
        items(items) { note ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = note.title, fontWeight = FontWeight.Bold)
                    Text(text = note.content)
                    Text(text = "Updated: ${note.updatedAtText}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

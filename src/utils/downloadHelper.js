import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from './formatters'

export const downloadAttendancePDF = (records, studentName) => {
  const doc = new jsPDF()

  doc.setFillColor(27, 43, 75)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('EduManage School', 14, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Attendance Report', 14, 28)
  doc.setFontSize(10)
  doc.text(`Student: ${studentName}`, 14, 36)

  doc.setTextColor(27, 43, 75)
  doc.setFontSize(9)
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 150, 48)

  autoTable(doc, {
    startY: 50,
    head: [['#', 'Date', 'Subject', 'Status', 'Note']],
    body: records.map((r, i) => [
      i + 1,
      formatDate(r.date),
      r.subject || '—',
      r.status,
      r.note || '—',
    ]),
    headStyles: {
      fillColor: [27, 43, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [244, 246, 251] },
    styles: { fontSize: 9, cellPadding: 4 },
  })

  doc.save(`attendance_${studentName.replace(' ', '_')}.pdf`)
}

export const downloadNotePDF = (note) => {
  const doc = new jsPDF()

  doc.setFillColor(27, 43, 75)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('EduManage School', 14, 18)
  doc.setFontSize(11)
  doc.text('Study Note', 14, 30)

  doc.setTextColor(27, 43, 75)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(note.title, 14, 55)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Subject: ${note.subject || 'General'} · ${formatDate(note.created_at)}`, 14, 63)

  doc.setTextColor(50, 50, 50)
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(note.content || '', 180)
  doc.text(lines, 14, 74)

  doc.save(`note_${note.title.replace(/ /g, '_')}.pdf`)
}

export const downloadAttendanceListPDF = (records, title = 'Attendance List') => {
  const doc = new jsPDF()

  doc.setFillColor(27, 43, 75)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('EduManage School', 14, 18)
  doc.setFontSize(12)
  doc.text(title, 14, 30)

  autoTable(doc, {
    startY: 50,
    head: [['#', 'Student Name', 'Date', 'Subject', 'Status']],
    body: records.map((r, i) => [
      i + 1,
      `${r.first_name} ${r.last_name}`,
      formatDate(r.date),
      r.subject || '—',
      r.status,
    ]),
    headStyles: { fillColor: [27, 43, 75], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [244, 246, 251] },
    styles: { fontSize: 9 },
  })

  doc.save('attendance_list.pdf')
}
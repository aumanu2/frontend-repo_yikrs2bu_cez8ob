import { useEffect, useMemo, useState } from 'react'

function SectionTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-md border transition-colors ${
            active === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

function Notice({ type = 'info', children }) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }
  return <div className={`border rounded p-3 text-sm ${styles[type]}`}>{children}</div>
}

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [activeTab, setActiveTab] = useState('Students')

  // Shared data
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])

  const [status, setStatus] = useState({ type: 'info', message: '' })

  const fetchStudents = async (q = '') => {
    const url = new URL(baseUrl + '/api/students')
    if (q) url.searchParams.set('q', q)
    const res = await fetch(url)
    const data = await res.json()
    setStudents(data)
  }

  const fetchCourses = async () => {
    const res = await fetch(baseUrl + '/api/courses')
    const data = await res.json()
    setCourses(data)
  }

  useEffect(() => {
    fetchStudents().catch(() => {})
    fetchCourses().catch(() => {})
  }, [])

  // Students form state
  const [stuForm, setStuForm] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: '',
    semester: 1,
    year: new Date().getFullYear(),
  })
  const [stuSearch, setStuSearch] = useState('')

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    setStatus({ type: 'info', message: 'Creating student...' })
    try {
      const res = await fetch(baseUrl + '/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stuForm,
          semester: Number(stuForm.semester),
          year: Number(stuForm.year),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      setStatus({ type: 'success', message: 'Student created' })
      setStuForm({ name: '', email: '', roll_number: '', department: '', semester: 1, year: new Date().getFullYear() })
      await fetchStudents(stuSearch)
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Courses form state
  const [courseForm, setCourseForm] = useState({ code: '', title: '', credits: 3 })
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setStatus({ type: 'info', message: 'Creating course...' })
    try {
      const res = await fetch(baseUrl + '/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...courseForm, credits: Number(courseForm.credits) }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      setStatus({ type: 'success', message: 'Course created' })
      setCourseForm({ code: '', title: '', credits: 3 })
      await fetchCourses()
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Results form state
  const [resultForm, setResultForm] = useState({
    student_id: '',
    course_id: '',
    score: 0,
    semester: 1,
    year: new Date().getFullYear(),
  })

  const handleAddResult = async (e) => {
    e.preventDefault()
    setStatus({ type: 'info', message: 'Adding result...' })
    try {
      const res = await fetch(baseUrl + '/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...resultForm,
          score: Number(resultForm.score),
          semester: Number(resultForm.semester),
          year: Number(resultForm.year),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      setStatus({ type: 'success', message: 'Result added' })
      setResultForm({ student_id: '', course_id: '', score: 0, semester: 1, year: new Date().getFullYear() })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Grade sheet
  const [selectedStudent, setSelectedStudent] = useState('')
  const [gradeQuery, setGradeQuery] = useState({ semester: '', year: '' })
  const [gradeSheet, setGradeSheet] = useState(null)

  const fetchGradeSheet = async () => {
    if (!selectedStudent) return
    const url = new URL(baseUrl + `/api/gradesheet/${selectedStudent}`)
    if (gradeQuery.semester) url.searchParams.set('semester', gradeQuery.semester)
    if (gradeQuery.year) url.searchParams.set('year', gradeQuery.year)
    const res = await fetch(url)
    const data = await res.json()
    setGradeSheet(data)
  }

  // UI helpers
  const SectionCard = ({ title, children, footer }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-4">{children}</div>
      {footer}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Result Management</h1>
          <p className="text-gray-600">Manage students, courses and results, and view grade sheets.</p>
        </div>

        {status.message && <div className="mb-6"><Notice type={status.type}>{status.message}</Notice></div>}

        <SectionTabs
          tabs={["Students", "Courses", "Results", "Grade Sheet", "Connectivity Test"]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'Students' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Add Student">
              <form onSubmit={handleCreateStudent} className="grid grid-cols-1 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Full name" value={stuForm.name} onChange={(e) => setStuForm({ ...stuForm, name: e.target.value })} required />
                <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={stuForm.email} onChange={(e) => setStuForm({ ...stuForm, email: e.target.value })} required />
                <input className="border rounded px-3 py-2" placeholder="Roll number" value={stuForm.roll_number} onChange={(e) => setStuForm({ ...stuForm, roll_number: e.target.value })} required />
                <input className="border rounded px-3 py-2" placeholder="Department" value={stuForm.department} onChange={(e) => setStuForm({ ...stuForm, department: e.target.value })} required />
                <div className="grid grid-cols-2 gap-3">
                  <input className="border rounded px-3 py-2" placeholder="Semester" type="number" min="1" max="12" value={stuForm.semester} onChange={(e) => setStuForm({ ...stuForm, semester: e.target.value })} required />
                  <input className="border rounded px-3 py-2" placeholder="Year" type="number" min="2000" max="2100" value={stuForm.year} onChange={(e) => setStuForm({ ...stuForm, year: e.target.value })} required />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mt-2">Save Student</button>
              </form>
            </SectionCard>

            <SectionCard title="Students List">
              <div className="flex gap-2">
                <input className="border rounded px-3 py-2 w-full" placeholder="Search name, roll, email" value={stuSearch} onChange={(e) => setStuSearch(e.target.value)} />
                <button onClick={() => fetchStudents(stuSearch)} className="border rounded px-4">Search</button>
              </div>
              <div className="max-h-80 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Roll</th>
                      <th className="p-2 text-left">Dept</th>
                      <th className="p-2 text-left">Sem</th>
                      <th className="p-2 text-left">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s._id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 font-mono">{s.roll_number}</td>
                        <td className="p-2">{s.department}</td>
                        <td className="p-2">{s.semester}</td>
                        <td className="p-2">{s.year}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={5}>No students found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'Courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Add Course">
              <form onSubmit={handleCreateCourse} className="grid grid-cols-1 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Course code" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} required />
                <input className="border rounded px-3 py-2" placeholder="Title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                <input className="border rounded px-3 py-2" placeholder="Credits" type="number" step="0.5" min="0" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })} required />
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mt-2">Save Course</button>
              </form>
            </SectionCard>

            <SectionCard title="Courses List">
              <div className="max-h-96 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Code</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 font-mono">{c.code}</td>
                        <td className="p-2">{c.title}</td>
                        <td className="p-2">{c.credits}</td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={3}>No courses found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'Results' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Add Result">
              <form onSubmit={handleAddResult} className="grid gap-3">
                <select className="border rounded px-3 py-2" value={resultForm.student_id} onChange={(e) => setResultForm({ ...resultForm, student_id: e.target.value })} required>
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} — {s.roll_number}</option>
                  ))}
                </select>
                <select className="border rounded px-3 py-2" value={resultForm.course_id} onChange={(e) => setResultForm({ ...resultForm, course_id: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-3">
                  <input className="border rounded px-3 py-2" placeholder="Score %" type="number" min="0" max="100" value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} required />
                  <input className="border rounded px-3 py-2" placeholder="Semester" type="number" min="1" max="12" value={resultForm.semester} onChange={(e) => setResultForm({ ...resultForm, semester: e.target.value })} required />
                  <input className="border rounded px-3 py-2" placeholder="Year" type="number" min="2000" max="2100" value={resultForm.year} onChange={(e) => setResultForm({ ...resultForm, year: e.target.value })} required />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mt-2">Save Result</button>
              </form>
            </SectionCard>

            <SectionCard title="Tips">
              <p className="text-gray-600 text-sm">Results automatically compute grade and grade points based on score.</p>
              <p className="text-gray-600 text-sm">Use the Grade Sheet tab to view a student's term performance and SGPA.</p>
            </SectionCard>
          </div>
        )}

        {activeTab === 'Grade Sheet' && (
          <div className="grid grid-cols-1 gap-6">
            <SectionCard title="View Grade Sheet">
              <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
                <select className="border rounded px-3 py-2" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} — {s.roll_number}</option>
                  ))}
                </select>
                <input className="border rounded px-3 py-2" placeholder="Semester (optional)" type="number" min="1" max="12" value={gradeQuery.semester} onChange={(e) => setGradeQuery({ ...gradeQuery, semester: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Year (optional)" type="number" min="2000" max="2100" value={gradeQuery.year} onChange={(e) => setGradeQuery({ ...gradeQuery, year: e.target.value })} />
                <button onClick={fetchGradeSheet} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Fetch</button>
              </div>

              {gradeSheet && (
                <div className="mt-5 space-y-3">
                  <Notice type="success">SGPA: <span className="font-semibold">{gradeSheet.sgpa}</span></Notice>
                  <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Course</th>
                          <th className="p-2 text-left">Score</th>
                          <th className="p-2 text-left">Grade</th>
                          <th className="p-2 text-left">Grade Point</th>
                          <th className="p-2 text-left">Semester</th>
                          <th className="p-2 text-left">Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeSheet.results.map((r, idx) => (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            <td className="p-2">{r.course_id}</td>
                            <td className="p-2">{r.score}</td>
                            <td className="p-2">{r.grade}</td>
                            <td className="p-2">{r.grade_point}</td>
                            <td className="p-2">{r.semester}</td>
                            <td className="p-2">{r.year}</td>
                          </tr>
                        ))}
                        {gradeSheet.results.length === 0 && (
                          <tr>
                            <td className="p-3 text-center text-gray-500" colSpan={6}>No results found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {activeTab === 'Connectivity Test' && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-3">Use the separate connectivity tester page.</p>
            <a href="/test" className="inline-block bg-gray-700 hover:bg-gray-800 text-white rounded px-4 py-2">Open Test Page</a>
          </div>
        )}

        <div className="mt-10 text-xs text-gray-500">Backend: {baseUrl}</div>
      </div>
    </div>
  )
}

export default App

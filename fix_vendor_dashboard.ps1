$file = "Frontend\src\pages\Vendor\VendorDashboard.tsx"
$content = Get-Content $file -Raw

# Fix 1: Add imports after existing imports
$content = $content -replace `
    "import serviceService from '../../services/api/serviceService';", `
    "import serviceService from '../../services/api/serviceService';`nimport vendorBookingService from '../../services/api/vendorBookingService';`nimport courseService from '../../services/api/courseService';"

# Fix 2: Replace stats state + fetchDashboardData
$oldCode = @"
  const \[stats, setStats\] = useState\(\{
    todayEarnings: 12450,
    pendingApprovals: 8,
    activeStudents: 42
  \}\);

  useEffect\(\(\) => \{
    fetchDashboardData\(\);
  \}, \[\]\);

  const fetchDashboardData = async \(\) => \{
    try \{
      setLoading\(true\);
      // Fetch dashboard stats here
      // const response = await dashboardService\.getStats\(\);
      // setStats\(response\.data\);
    \} catch \(error\) \{
      console\.error\('Error fetching dashboard data:', error\);
    \} finally \{
      setLoading\(false\);
    \}
  \};
"@

$newCode = @"
  const [stats, setStats] = useState({
    todayEarnings: 0,
    pendingApprovals: 0,
    activeStudents: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingStatsRes, bookingsRes, coursesRes] = await Promise.all([
        vendorBookingService.getBookingStats(),
        vendorBookingService.getVendorBookings({}),
        courseService.getMyCourses(),
      ]);
      const bookings = bookingsRes.data || [];
      const courses = coursesRes.data || [];
      const bStats = bookingStatsRes.data || {};
      setStats({
        todayEarnings: bookings
          .filter((b: any) => b.status === 'completed')
          .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
        pendingApprovals: bStats.pending || 0,
        activeStudents: courses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0),
        totalBookings: bStats.total || 0,
        completedBookings: bStats.completed || 0,
        cancelledBookings: bStats.cancelled || 0,
      });
      setRecentBookings(bookings.slice(0, 5));
      setMyCourses(courses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
"@

$content = $content -replace $oldCode, $newCode

# Fix 3: Replace dummy bookings table body with real data
$oldTable = @"
                  <tbody style=\{\{
                    borderTop: '1px solid #f1f5f9'
                  \}\}>
                    <tr style=\{\{ borderBottom: '1px solid #f1f5f9' \}\}>
                      <td style=\{\{ padding: '16px 24px' \}\}>
                        <div style=\{\{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        \}\}>
                          <div style=\{\{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#cbd5e1'
                          \}\} />
                          <div>
                            <p style=\{\{
                              fontSize: '14px',
                              fontWeight: 700,
                              margin: 0,
                              fontFamily: 'Montserrat, sans-serif'
                            \}\}>
                              Rohan Mehra
                            </p>
                            <p style=\{\{
                              fontSize: '10px',
                              color: '#94a3b8',
                              margin: 0,
                              fontFamily: 'Montserrat, sans-serif'
                            \}\}>
                              #GB-9921
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style=\{\{
                        padding: '16px 24px',
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: 'Montserrat, sans-serif'
                      \}\}>
                        Beard Trim & Spa
                      </td>
                      <td style=\{\{
                        padding: '16px 24px',
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif'
                      \}\}>
                        Rs. 850
                      </td>
                      <td style=\{\{ padding: '16px 24px' \}\}>
                        <span style=\{\{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#10b981',
                          textTransform: 'uppercase',
                          fontFamily: 'Montserrat, sans-serif'
                        \}\}>
                          Completed
                        </span>
                      </td>
                    </tr>
"@

$newTable = @"
                  <tbody style={{
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    {recentBookings.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>No bookings yet</td></tr>
                    ) : recentBookings.map((booking: any) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#5B62B3' }}>
                              {booking.clientName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{booking.clientName}</p>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{booking.clientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}>
                          {booking.serviceId?.title || 'Service'}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                          Rs. {booking.totalPrice?.toLocaleString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700,
                            backgroundColor: booking.status === 'completed' ? '#ecfdf5' : booking.status === 'confirmed' ? '#eff6ff' : booking.status === 'cancelled' ? '#fef2f2' : '#fffbeb',
                            color: booking.status === 'completed' ? '#10b981' : booking.status === 'confirmed' ? '#3b82f6' : booking.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                            textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
"@

$content = $content -replace $oldTable, $newTable

# Fix 4: Replace dummy courses section
$oldCourses = @"
              <div style=\{\{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              \}\}>
                \{/\* Course 1 \*/\}
                <div>
                  <div style=\{\{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  \}\}>
                    <p style=\{\{
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      Makeup Artistry Masterclass
                    </p>
                    <span style=\{\{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#94a3b8',
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      82%
                    </span>
                  </div>
                  <div style=\{\{
                    width: '100%',
                    backgroundColor: '#f1f5f9',
                    height: '8px',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  \}\}>
                    <div style=\{\{
                      backgroundColor: '#5B62B3',
                      height: '100%',
                      width: '82%',
                      borderRadius: '9999px'
                    \}\} />
                  </div>
                  <p style=\{\{
                    fontSize: '10px',
                    color: '#94a3b8',
                    marginTop: '8px',
                    fontFamily: 'Montserrat, sans-serif'
                  \}\}>
                    12 students on track
                  </p>
                </div>

                \{/\* Course 2 \*/\}
                <div>
                  <div style=\{\{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  \}\}>
                    <p style=\{\{
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      Skin Therapy Basics
                    </p>
                    <span style=\{\{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#94a3b8',
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      45%
                    </span>
                  </div>
                  <div style=\{\{
                    width: '100%',
                    backgroundColor: '#f1f5f9',
                    height: '8px',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  \}\}>
                    <div style=\{\{
                      backgroundColor: '#5B62B3',
                      height: '100%',
                      width: '45%',
                      borderRadius: '9999px'
                    \}\} />
                  </div>
                  <p style=\{\{
                    fontSize: '10px',
                    color: '#94a3b8',
                    marginTop: '8px',
                    fontFamily: 'Montserrat, sans-serif'
                  \}\}>
                    8 students starting module 3
                  </p>
                </div>

                \{/\* Course 3 \*/\}
                <div>
                  <div style=\{\{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  \}\}>
                    <p style=\{\{
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      Hair Styling & Updos
                    </p>
                    <span style=\{\{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#94a3b8',
                      fontFamily: 'Montserrat, sans-serif'
                    \}\}>
                      10%
                    </span>
                  </div>
                  <div style=\{\{
                    width: '100%',
                    backgroundColor: '#f1f5f9',
                    height: '8px',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  \}\}>
                    <div style=\{\{
                      backgroundColor: '#5B62B3',
                      height: '100%',
                      width: '10%',
                      borderRadius: '9999px'
                    \}\} />
                  </div>
                  <p style=\{\{
                    fontSize: '10px',
                    color: '#94a3b8',
                    marginTop: '8px',
                    fontFamily: 'Montserrat, sans-serif'
                  \}\}>
                    New batch launched today
                  </p>
                </div>
"@

$newCourses = @"
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {myCourses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>
                    No courses yet. Create your first course!
                  </div>
                ) : myCourses.map((course: any) => (
                  <div key={course._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                        {course.title}
                      </p>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>
                        {course.status}
                      </span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#5B62B3', height: '100%', width: `${Math.min((course.enrollmentCount || 0) * 10, 100)}%`, borderRadius: '9999px' }} />
                    </div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontFamily: 'Montserrat, sans-serif' }}>
                      {course.enrollmentCount || 0} students enrolled
                    </p>
                  </div>
                ))}
"@

$content = $content -replace $oldCourses, $newCourses

Set-Content $file $content
Write-Host "Done! VendorDashboard.tsx updated with real data."

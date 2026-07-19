export const weeklyTimetableMock = [
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "09:00 AM - 10:00 AM",
    isBreak: false,
    schedule: [null, null, null, null, null, null]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "10:00 AM - 11:00 AM",
    isBreak: false,
    schedule: [
      // Monday
      { courseCode: "CS201 \\ EC201", courseName: "Data Structures and Algorithms \\ Digital System", facultyName: "R N / DN \\ NA / HG", roomNo: "CSE LAB 2 \\ ECE LAB 3", group: "Group 1 \\ Group 2" },
      // Tuesday
      { courseCode: "EC201", courseName: "Digital System", facultyName: "HG", roomNo: "CR 4" },
      // Wednesday
      { courseCode: "HS201", courseName: "Effective Analytical Skills", facultyName: "BP / KY", roomNo: "CR 5" },
      // Thursday
      { courseCode: "EC201", courseName: "Digital System", facultyName: "HG", roomNo: "CR 6" },
      // Friday
      { courseCode: "CS201", courseName: "Data Structures and Algorithms", facultyName: "DN", roomNo: "CR 6" },
      // Saturday
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "11:00 AM - 12:00 PM",
    isBreak: false,
    schedule: [
      // Monday (continuation of 10-11 lab block)
      { courseCode: "CS201 \\ EC201", courseName: "Data Structures and Algorithms \\ Digital System", facultyName: "R N / DN \\ NA / HG", roomNo: "CSE LAB 2 \\ ECE LAB 3", group: "Group 1 \\ Group 2" },
      // Tuesday
      { courseCode: "HS201", courseName: "Effective Analytical Skills", facultyName: "BP / KY", roomNo: "CR 4" },
      // Wednesday
      { courseCode: "EC201 \\ CS202", courseName: "Digital System \\ ICT Workshop-II", facultyName: "NA / HG \\ DP / AT", roomNo: "ECE LAB 3 \\ CSE LAB 3", group: "Group 1 \\ Group 2" },
      // Thursday
      { courseCode: "CS202 \\ CS202", courseName: "ICT Workshop-II \\ ICT Workshop-II", facultyName: "DP / RDM \\ RP / SR", roomNo: "CSE LAB 3 \\ ECE LAB 3", group: "Group 1 \\ Group 2" },
      // Friday
      { courseCode: "CS202 \\ CS201", courseName: "ICT Workshop-II \\ Data Structures and Algorithms", facultyName: "RP / SR \\ DN / R N", roomNo: "CSE LAB 2 \\ CSE LAB 3", group: "Group 1 \\ Group 2" },
      // Saturday
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "12:00 PM - 01:00 PM",
    isBreak: false,
    schedule: [
      null,
      null,
      // Wednesday (continuation of 11-12 lab block)
      { courseCode: "EC201 \\ CS202", courseName: "Digital System \\ ICT Workshop-II", facultyName: "NA / HG \\ DP / AT", roomNo: "ECE LAB 3 \\ CSE LAB 3", group: "Group 1 \\ Group 2" },
      // Thursday (continuation)
      { courseCode: "CS202 \\ CS202", courseName: "ICT Workshop-II \\ ICT Workshop-II", facultyName: "DP / RDM \\ RP / SR", roomNo: "CSE LAB 3 \\ ECE LAB 3", group: "Group 1 \\ Group 2" },
      // Friday (continuation)
      { courseCode: "CS202 \\ CS201", courseName: "ICT Workshop-II \\ Data Structures and Algorithms", facultyName: "RP / SR \\ DN / R N", roomNo: "CSE LAB 2 \\ CSE LAB 3", group: "Group 1 \\ Group 2" },
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "01:00 PM - 02:00 PM",
    isBreak: false,
    schedule: [
      { courseCode: "CS201", courseName: "Data Structures and Algorithms", facultyName: "DN", roomNo: "CR 6" },
      { courseCode: "MS201", courseName: "Probability Theory and Stochastic Processes", facultyName: "APS", roomNo: "CR 6" },
      null,
      null,
      null,
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "02:00 PM - 03:00 PM",
    isBreak: false,
    schedule: [
      { courseCode: "MS202", courseName: "Discrete Mathematics", facultyName: "PS", roomNo: "CR 5" },
      { courseCode: "CS201", courseName: "Data Structures and Algorithms", facultyName: "DN", roomNo: "CR 6" },
      { courseCode: "MS201", courseName: "Probability Theory and Stochastic Processes", facultyName: "VP", roomNo: "CR 1" },
      { courseCode: "MS202", courseName: "Discrete Mathematics", facultyName: "APS / PS / VP", roomNo: "CR 6" },
      { courseCode: "EC201", courseName: "Digital System", facultyName: "HG", roomNo: "CR 5" },
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "03:00 PM - 04:00 PM",
    isBreak: false,
    schedule: [
      { courseCode: "MS201", courseName: "Probability Theory and Stochastic Processes", facultyName: "APS", roomNo: "CR 5" },
      { courseCode: "MS201", courseName: "Probability Theory and Stochastic Processes", facultyName: "APS / PS / VP", roomNo: "CR 6" },
      { courseCode: "MS202", courseName: "Discrete Mathematics", facultyName: "PS", roomNo: "CR 5" },
      null,
      { courseCode: "MS202", courseName: "Discrete Mathematics", facultyName: "VP", roomNo: "CR 5" },
      null
    ]
  },
  {
    semester: 2,
    batch: "CSE 1",
    timeSlot: "04:00 PM - 05:00 PM",
    isBreak: false,
    schedule: [null, null, null, null, null, null]
  }
];
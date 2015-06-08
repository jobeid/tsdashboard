/*
* 3/26/2015
* Tom Evans
* Hash table object for linking authors to institutions and
* departments
*/

'user strict';

var files = [
  'json!../dat/musc_json/departments.json',
  'json!../dat/musc_json/personel.json'
];

define(files, function(deptData, personelData) {
  var institutions = {
    '13':'Greenville Hospital System University Medical Center',
		'14':'Medical University of South Carolina',
		'15':'University of South Carolina',
		'16':'University of South Carolina School of Medicine',
		'17':'Clemson University',
		'18':'USC SoM Greenville'
  },
  personel = {},
  departmentNames = {};


	personelData.forEach(function(row) {
		personel[row.PersonID] = {deptID:row.DepartmentID,instID:row.InstitutionID};
	});

	deptData.forEach(function(row) {
		departmentNames[row.DepartmentID] = row.Department;
	});

  return {
    institutions:institutions,
    departments:departmentNames,
    personel:personel,
    getDeptName: function(pid) {
      var instID = personel[pid].instID,
        depID = personel[pid].deptID;

      if (instID == 14) {
        return departmentNames[depID];
      } else {
        return institutions[instID];
      }
    }
  }
});

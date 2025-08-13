import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import SearchBar from "@/components/molecules/SearchBar";
import StatusPill from "@/components/molecules/StatusPill";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import gradeService from "@/services/api/gradeService";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
const [newStudent, setNewStudent] = useState({
    first_name_c: "",
    last_name_c: "",
    email_c: "",
    phone_c: "",
    grade_level_c: 9,
    date_of_birth_c: ""
  });
  const [studentGrades, setStudentGrades] = useState({});
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
      
      // Load grade averages for each student
      const grades = {};
      for (const student of data) {
        try {
          const average = await gradeService.getStudentAverage(student.Id);
          grades[student.Id] = average;
        } catch (err) {
          grades[student.Id] = 0;
        }
      }
      setStudentGrades(grades);
    } catch (err) {
      setError(err.message || "Failed to load students");
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, statusFilter, gradeFilter]);

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
if (searchQuery) {
const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name_c?.toLowerCase().includes(query) ||
        student.last_name_c?.toLowerCase().includes(query) ||
        student.email_c?.toLowerCase().includes(query)
      );
    }

    // Status filter
if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.status_c === statusFilter);
    }

    // Grade level filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter(student => student.grade_level_c === parseInt(gradeFilter));
    }

    setFilteredStudents(filtered);
  };

const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        first_name_c: newStudent.first_name_c,
        last_name_c: newStudent.last_name_c,
        email_c: newStudent.email_c,
        phone_c: newStudent.phone_c,
        grade_level_c: parseInt(newStudent.grade_level_c),
        date_of_birth_c: newStudent.date_of_birth_c,
        status_c: "active"
      };
      const createdStudent = await studentService.create(studentData);
      setStudents(prev => [...prev, createdStudent]);
      setNewStudent({
        first_name_c: "",
        last_name_c: "",
        email_c: "",
        phone_c: "",
        grade_level_c: 9,
        date_of_birth_c: ""
      });
      setShowAddModal(false);
      toast.success("Student added successfully!");
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    try {
      await studentService.delete(id);
      setStudents(prev => prev.filter(s => s.Id !== id));
      toast.success("Student deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  const getGradeLetter = (average) => {
    if (average === 0) return "N/A";
    return gradeService.calculateLetterGrade(average);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadStudents} />;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Students</h1>
          <p className="text-gray-600 mt-1">Manage your student roster and view academic progress</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center">
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 min-w-0">
              <SearchBar
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </Select>
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full sm:w-48"
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Directory</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredStudents.length} of {students.length} students
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <Empty
              title={searchQuery || statusFilter !== "all" || gradeFilter !== "all" ? "No students match your filters" : "No students yet"}
              description={searchQuery || statusFilter !== "all" || gradeFilter !== "all" ? "Try adjusting your search or filters" : "Add your first student to get started"}
              icon="Users"
              action={searchQuery || statusFilter !== "all" || gradeFilter !== "all" ? undefined : () => setShowAddModal(true)}
              actionLabel="Add Student"
            />
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.Id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                  onClick={() => navigate(`/students/${student.Id}`)}
                >
                  <div className="flex items-center space-x-4">
<Avatar
                      initials={`${student.first_name_c?.[0] || '?'}${student.last_name_c?.[0] || '?'}`}
                      size="default"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.first_name_c || ''} {student.last_name_c || ''}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{student.email_c || ''}</span>
                        <span>•</span>
                        <span>Grade {student.grade_level_c || ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Average</div>
                      <div className="font-semibold gradient-text">
                        {studentGrades[student.Id] 
                          ? `${Math.round(studentGrades[student.Id])}% (${getGradeLetter(studentGrades[student.Id])})`
                          : "No grades"
                        }
                      </div>
                    </div>
                    <StatusPill status={student.status_c || 'active'} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student.Id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Add New Student
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
<div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={newStudent.first_name_c}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, first_name_c: e.target.value }))}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={newStudent.last_name_c}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, last_name_c: e.target.value }))}
                    required
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={newStudent.email_c}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email_c: e.target.value }))}
                  required
                />
                
                <Input
                  label="Phone"
                  type="tel"
                  value={newStudent.phone_c}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, phone_c: e.target.value }))}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Grade Level"
                    value={newStudent.grade_level_c}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, grade_level_c: parseInt(e.target.value) }))}
                    required
                  >
                    <option value={9}>Grade 9</option>
                    <option value={10}>Grade 10</option>
                    <option value={11}>Grade 11</option>
                    <option value={12}>Grade 12</option>
                  </Select>
                  
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={newStudent.date_of_birth_c}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth_c: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Student
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Students;
const bcrypt = require('bcryptjs');
const { db, User, Course, Assignment, StudySession } = require('./setup');


async function seedDatabase() {
    try {
        // Force sync to reset database
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        // Create sample users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await User.bulkCreate([
            // Create 2 Teacher Users
            {
                name: 'Prof. John Doe',
                email: 'john@school.com',
                password: hashedPassword,
                role: 'teacher'
            },
            {
                name: 'Prof. Jane Smith',
                email: 'jane@school.com',
                password: hashedPassword,
                role: 'teacher'
            },
            // Create 4 Student Users
            {
                name: 'Mike Wheeler',
                email: 'mike@school.com',
                password: hashedPassword,
                role: 'student'
            },
            {
                name: 'Nancy Wheeler',
                email: 'nancy@school.com',
                password: hashedPassword,
                role: 'student'
            },
            {
                name: 'Dustin Henderson',
                email: 'dustin@school.com',
                password: hashedPassword,
                role: 'student'
            },
            {
                name: 'Lucas Sinclair',
                email: 'lucas@school.com',
                password: hashedPassword,
                role: 'student'
            }
        ]);
        const [profjohn, profjane, mike, nancy, dustin, lucas] = users;


        // Create sample courses
        const courses = await Course.bulkCreate([
            {
                courseName: 'Computer Science 101',
                teacherName: profjohn.name,
                semester: 'Fall 2026',
                teacherId: profjohn.id
            },
            {
                courseName: 'Physics 201',
                teacherName: profjane.name,
                semester: 'Fall 2026',
                teacherId: profjane.id
            },
            {
                courseName: 'Computer Science 102',
                teacherName: profjohn.name,
                semester: 'Fall 2026',
                teacherId: profjohn.id
            },
            {
                courseName: 'Physics 202',
                teacherName: profjane.name,
                semester: 'Fall 2026',
                teacherId: profjane.id
            },
            {
                courseName: 'Physics 203',
                teacherName: profjane.name,
                semester: 'Fall 2026',
                teacherId: profjane.id
            }
        ]);
        const [cs101, phy201, cs102, phy202, phy203] = courses;

        const assignments = await Assignment.bulkCreate([
            // CS101 Assignments
            {
                title: 'Python Hello World',
                description: 'Create a basic python program that prints "Hello, World!"',
                dueDate: new Date('2026-09-20'),
                courseId: cs101.id
            },
            {
                title: 'Python Calculator',
                description: 'Create a simple Python calculator with basic operations.',
                dueDate: new Date('2026-09-20'),
                courseId: cs101.id
            },
            // PHY201 Assignments
            {
                title: 'Newtons Laws Lab',
                description: 'Conduct an experiment to verify Newtons laws of motion.',
                dueDate: new Date('2026-09-20'),
                courseId: phy201.id
            },
            {
                title: 'Projectile Motion',
                description: 'Analyze the projectile motion of a launched object.',
                dueDate: new Date('2026-09-20'),
                courseId: phy201.id
            },
            // CS102 Assignments
            {
                title: 'JavaScript DOM Manipulation',
                description: 'Create a web page that allows users to manipulate the DOM using JavaScript.',
                dueDate: new Date('2026-09-20'),
                courseId: cs102.id
            },
            {
                title: 'JavaScript To-Do List',
                description: 'Build a simple to-do list application using JavaScript.',
                dueDate: new Date('2026-09-20'),
                courseId: cs102.id
            },
            // PHY202 Assignments
            {
                title: 'Electric Circuits Lab',
                description: 'Build and analyze simple electric circuits.',
                dueDate: new Date('2026-09-20'),
                courseId: phy202.id
            },
            {
                title: 'Magnetism Experiment',
                description: 'Investigate the properties of magnets and magnetic fields.',
                dueDate: new Date('2026-09-20'),
                courseId: phy202.id
            },
            // PHY203 Assignments
            {
                title: 'Thermodynamics Lab',
                description: 'Study the principles of thermodynamics through experiments.',
                dueDate: new Date('2026-09-20'),
                courseId: phy203.id
            },
            {
                title: 'Optics Experiment',
                description: 'Explore the behavior of light and optics.',
                dueDate: new Date('2026-09-20'),
                courseId: phy203.id
            }   
        ]);
    
        // Create study sessions
        const studySessions = await StudySession.bulkCreate([
            {
                startTime: new Date('2026-09-15T14:00:00'),
                endTime: new Date('2026-09-15T16:00:00'),
                notes: 'Studied for CS101 Python assignment',
                userId: mike.id,
                courseId: cs101.id
            },
            {
                startTime: new Date('2026-09-16T10:00:00'),
                endTime: new Date('2026-09-16T12:00:00'),
                notes: 'Reviewed Newtons Laws for PHY201',
                userId: nancy.id,
                courseId: phy201.id
            },
            {
                startTime: new Date('2026-09-17T18:00:00'),
                endTime: new Date('2026-09-17T20:00:00'),
                notes: 'Worked on JavaScript To-Do List for CS102',
                userId: dustin.id,
                courseId: cs102.id
            },
            {
                startTime: new Date('2026-09-18T15:00:00'),
                endTime: new Date('2026-09-18T17:00:00'),
                notes: 'Prepared for Electric Circuits Lab in PHY202',
                userId: lucas.id,
                courseId: phy202.id
             },
            {
                startTime: new Date('2026-09-19T10:00:00'),
                endTime: new Date('2026-09-19T12:00:00'),
                notes: 'Studied Thermodynamics for PHY203',
                userId: mike.id,
                courseId: phy203.id
            }
        ]);

        // Enroll students in courses
        await cs101.addStudents([mike, nancy]);
        await phy201.addStudents([nancy, dustin]);
        await cs102.addStudents([dustin, lucas]);
        await phy202.addStudents([lucas, mike]);
        await phy203.addStudents([mike, nancy]);

        console.log('Database seeded successfully!');
        console.log('Sample users created:');
        console.log('- john@school.com / password123');
        console.log('- jane@school.com / password123');
        console.log('- mike@school.com / password123');
        console.log('- nancy@school.com / password123');
        console.log('- dustin@school.com / password123');
        console.log('- lucas@school.com / password123');
        console.log('Total courses created:', await Course.count());
        console.log('Total assignments created:', await Assignment.count());
        console.log('Total study sessions created:', await StudySession.count());
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.close();
    }
}

seedDatabase();
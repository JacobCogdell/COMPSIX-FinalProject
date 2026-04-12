const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'study.db',
    logging: false
});

// User Model
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student',
        validate: {
            isIn: [['student', 'teacher']]
        }
    }
});

const Course = db.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Assignment = db.define('Assignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});



const StudySession = db.define('StudySession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// Realtionships
// A teacher (User) can create many courses
User.hasMany(Course, { foreignKey: 'teacherId', as: 'taughtCourses' });
Course.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// A course can have many assignments
Course.hasMany(Assignment, { foreignKey: 'courseId' });
Assignment.belongsTo(Course, { foreignKey: 'courseId' });

// Students can enroll in many courses (M:N)
User.belongsToMany(Course, { through: 'Enrollments', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: 'Enrollments', as: 'students' });

// Study sessions connect users + courses
User.hasMany(StudySession, { foreignKey: 'userId' });
StudySession.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(StudySession, { foreignKey: 'courseId' });
StudySession.belongsTo(Course, { foreignKey: 'courseId' });

// Initialize database
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Database connection established successfully.');
        
        await db.sync({ force: false });
        console.log('Database synchronized successfully.');
        
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
}

initializeDatabase();

// Export everything
module.exports = {
    db,
    Sequelize,
    User,
    Course,
    Assignment,
    StudySession
};

import React, { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Task.css';
import { useParams } from 'react-router-dom';

export default function Task() {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [selectFile, setSelectFile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [trainerName, setTrainerName] = useState('');
    const [taskName, setTaskName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [remainingTime, setRemainingTime] = useState(0);

    const { id } = useParams();


    //   Fetch data from backend(task)--

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/task/allTask');
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    // Fetch trainerName, startTime, endTime data from backend--

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/task/get/1?timestamp=${new Date().getTime()}`);
                setTrainerName(response.data.trainerName);
                setStartTime(response.data.startTime);
                setEndTime(response.data.endTime);
                setTaskName(response.data.taskName);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);


    // Current date and time--

    useEffect(() => {
        const getCurrentDateTime = () => {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            const formattedTime = `${hours}:${minutes}`;
            setDate(formattedDate);
            setTime(formattedTime);
        };
        getCurrentDateTime();
    }, []);


    // Calculates remaining time in timer--

    useEffect(() => {
        const calculateRemainingTime = () => {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const durationInSeconds = Math.floor((end - start) / 1000);
            const storedRemainingTime = localStorage.getItem('remainingTime');
            setRemainingTime(storedRemainingTime ? parseInt(storedRemainingTime) : durationInSeconds);

        };

        calculateRemainingTime();
    }, [startTime, endTime]);

        // Save data--

        const saveNotes = async () => {
            if (!selectFile || !notes) {
                alert('Please fill all the required fields');
                return;
            }
        
            let status = "Completed";
            
            const isConfirmed = window.confirm('Are you sure you want to send the file?');
        
            if (isConfirmed) {
                const formData = new FormData();
                formData.append('file', selectFile);
                formData.append('notes', notes);
                formData.append('status', status);
        
                try {
                    const response = await axios.post('http://localhost:8086/reports/saveReport', formData);
                    console.log('Server response:', response.data);
                    alert('File sent successfully');
                    setRemainingTime(0);
                    window.location.reload();
                } catch (error) {
                    console.log('Error', error.message);
                    alert('Error occurred while sending file');
                }
            }
        };


    // Manages Bar--

    const totalTime = (new Date(`2000-01-01T${endTime}`) - new Date(`2000-01-01T${startTime}`)) / 1000;
    const remainingPercentage = (remainingTime / totalTime) * 100;

   
    useEffect(() => {
        let statusSaved = false;
        const interval = setInterval(async () => {
            setRemainingTime(prevTime => {
                const newTime = prevTime - 1;
                if (newTime === 0 && !statusSaved) { 
                    const saveStatus = async () => {
                        try {
                            const response = await axios.post('http://localhost:8086/reports/saveReport', {}, {
                                params: { status: "Not Completed" }
                            });
                            console.log('Status updated successfully:', response.data);
                        } catch (error) {
                            console.error('Error updating status:', error);
                        }
                    };
                    saveStatus();
                    statusSaved = true; 
                }
                localStorage.setItem('remainingTime', newTime);
                return newTime;
            });
        }, 1000);
    
        return () => clearInterval(interval); // Cleanup function to clear interval
    }, []);
    
    


    // Handle file--

    const handleViewFiles = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/task/allTask/${id}`, { responseType: 'blob' });

            const contentType = response.headers['content-type'];
            const file = new Blob([response.data], { type: contentType });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (error) {
            console.error('Error handling view files:', error);
        }
    };

    const handleFileChange = (e) => {
        setSelectFile(e.target.files[0]);
    };

    
    

    // Calculate backend data for duration--

    function calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const duration = (end - start) / 1000;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours} hours ${minutes} minutes`;
    }

    // fetch duration in timer--

    function calculate(startTime, endTime) {
        const durationInSeconds = Math.max(remainingTime, 0);

        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }


    // Prevent back button--

    const handleBack = (event) => {
        event.preventDefault();
        alert(`You can't leave the ${taskName} assessment`);
        window.history.pushState(null, null, 'http://localhost:3000/task');
    };

    React.useEffect(() => {
        window.history.pushState(null, null, 'http://localhost:3000/task');
        window.addEventListener('popstate', handleBack);

        return () => {
            window.removeEventListener('popstate', handleBack);
        };

    }, []);



    return (
        <div className='container-fluid'>
            <div className='container'>
                <div className='main'>
                    <div className='header'>
                        <h3>Task</h3>
                    </div>

                    <div className='side'>
                        <div className="trainer">
                            <label htmlFor="trainer">Trainer Name:</label>
                            <input style={{ fontSize: "20px" }} type="text" readOnly id="trainer" placeholder="Trainer name" value={trainerName} />
                        </div>

                        <div className='current'>
                            <div className="date">
                                <label htmlFor="dateInput">Date:</label>
                                <input type="date" readOnly id="dateInput" placeholder="Date" value={date} />
                            </div>

                            <div className="time">
                                <label htmlFor="timeInput">Time:</label>
                                <input type="time" readOnly id="timeInput" placeholder="Time" value={time} />
                            </div>
                        </div>
                    </div>

                    <div className='clock'>
                        <CircularProgressbar
                            value={remainingPercentage}
                            text={remainingTime > 0 ? calculate(remainingTime) : '00:00:00'}
                            styles={{
                                path: {
                                    stroke: remainingTime <= 300 ? 'red' : 'black',
                                },
                                text: {
                                    fill: remainingTime <= 300 ? 'red' : 'black',
                                },
                            }}
                        />


                    </div>
                </div>

                <div className='table-responsive'>
                    <div className='tabular'>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Task Name</th>
                                    <th scope="col">Task Description</th>
                                    <th scope="col">Ref. File</th>
                                    <th scope="col">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>{task.taskName}</td>
                                        <td>{task.taskDescription}</td>
                                        <td><button onClick={() => handleViewFiles(task.id)} type="button" className="bttn1">view</button></td>
                                        <td>{calculateDuration(task.startTime, task.endTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form>
                    <div className='attach'>
                        <div>
                            <div>
                                <label className='note' htmlFor="notes">Notes:</label>
                            </div>
                            <ReactQuill
                                theme="snow"
                                value={notes}
                                onChange={setNotes}
                                placeholder="Write your comments here..."
                                className="editor"
                            />
                        </div>
                        <label style={{ marginRight: "10px" }} className='file' htmlFor="file">Task file:</label>
                        <input type="file" id="file" onChange={handleFileChange} />
                        <button type="button" onClick={saveNotes}>Send</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


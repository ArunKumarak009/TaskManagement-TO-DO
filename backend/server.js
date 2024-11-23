const express = require('express');
const db = require('./config/db');

const Joi = require('joi');

const app = express();

app.use(express.json())



const PORT = 3000;

//DB Conection

db.query('SELECT 1').then(()=>{
  console.log("my sql db connected")
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((e)=>{
  console.log(e)
})

//validate schema for title & description
const schoolSchema = Joi.object({
 
  title: Joi.string().max(450).required().label('Title'), // VARCHAR
  description: Joi.string().max(450).required().label('Description'), // VARCHAR

});


//GET method to retrive tasks

app.get('/tasks', async (req, res) => {
  try{

    const response = await db.query(`SELECT * FROM tasks`)
    if(!response){
        res.status(404).send({
        success:false,
        message:"no recors found",
        
      })
    }
    res.status(200).send({
      success:true,
      message:"tasks records found",
      data:response[0]
    })
  }catch(error){
    res.status(404).send({
      success:false,
      message:"no recors found",
      error
    })
  }
});



//POST method to add task to tasks

app.post('/tasks', async (req, res) => {

  const {title,description} = req.body 
  const { error, value } = schoolSchema.validate(req.body);
  try{

    if(error){
      res.status(400).send({
        success:false,
        error:error.details[0].message,
    
      })
    }
    else{

      const response = await db.query(`
  
        INSERT INTO tasks ( title, description)
        VALUES ( '${title}', '${description}');`
           )
          
          res.status(200).send({
            success:true,
            message:"successfully record Added",
            data:response

          })
    }
     
  }catch(error){
    res.status(200).send({
      success:false,
      message:"failed to ADD record",
      error
    })
  }
});

//PUT method to edit details of task
app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id; // Get task ID from URL
  const { title, description, status } = req.body; // Get updated details from request body

  
  const data = await db.query(`SELECT * FROM tasks WHERE task_id = ${taskId}`)   
  const oldStatus = data[0][0]['status'] 



  const taskArray = ["TO DO" , "IN PROGRESS" , "COMPLETED"]


  if(oldStatus === "COMPLETED"){
   return res.send({ message: 'Task alredy Completed', taskId });

  }

    if (!title || !description || !status) {
     return  res.status(400).send({ error: 'All fields (title, description, status) are required' });
    }

   if ( !taskArray.includes(status)) {
     return res.status(400).send({
      success:false,
      error: 'Invalid status. Valid statuses are: pending, in-progress, completed',
     });
  }
    // SQL query to update the task
    const query = `UPDATE tasks SET title = '${title}', description = '${description}', status = '${status}' WHERE task_id = ${taskId}`;
  
  
    const response = await db.query(query)
      

      if (response[0].affectedRows === 0) {
       return  res.status(400).json({ error: 'Task not found' });
      }
      res.send({ message: 'Task updated successfully', taskId });
  }
  
  ); 

//DELETE method to delete task 

app.delete('/task/:id',  async (req, res) => {
  const studentId = req.params.id;
  try{
    
  // MySQL DELETE query
    const deleteQuery = `DELETE FROM tasks WHERE task_id = ${studentId}`;

    const response = await db.query(deleteQuery) 
    if (response[0].affectedRows === 0) {
      res.status(400).json({ message: 'Task not found' });
   }else{
     res.status(200).json({ message: 'Task deleted successfully', affectedRows: response[0].affectedRows });
   }
  }catch(error){
    res.status(404).send({
      success:false,
      message:"Task faild to delete",error
    })
  }
});
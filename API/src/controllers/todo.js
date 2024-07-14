import Todo from "../models/todo.js";

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
//import fs from 'fs/promises';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllByUser = async (req, res, next) => {
    const userId = req.params.userId;

    try {
      const todos = await Todo.find({ userId: userId });


      if (todos.length > 0  && todos[0].userId !== req.userId)  return res.status(403).send("You are not allowed!");
      
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const add = async (req, res, next) => {
  console.log(req.body);
    const { userId, todo, tag } = req.body; 
    let img, file;
    if (req.files != undefined ) {
      img = req.files['thumbnail'] ? req.files['thumbnail'][0].filename : '';
      file = req.files['file'] ? req.files['file'][0].filename : '';
    }
    
    
    //try {
        const newTodo = new Todo({
        userId,
        img,
        file,
        todo,
        tag
        });

        const savedTodo = await newTodo.save();

        res.status(201).json(savedTodo);
    //} catch (error) {
      //  res.status(500).json({ message: error.message });
    //}
};

export const deleteById = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const todoToDelete = await Todo.findById(_id);

    if (!todoToDelete) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todoToDelete.userId !== req.userId)  return res.status(403).send("You are not allowed!");

    try {
      if (todoToDelete.img !== '') {
        const imgPath = path.join(__dirname, '../../uploads', todoToDelete.img);
        await fs.unlink(imgPath); 
      }
      if (todoToDelete.file !== '') {
        const filePath = path.join(__dirname, '../../uploads', todoToDelete.file);
        await fs.unlink(filePath);
      }
    } catch {
      console.log('files do no exits');
    }
    
    await Todo.findByIdAndDelete(_id);

    res.status(200).json({ message: 'Todo and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo and files:', error);
    res.status(500).json({ message: error.message });
  }
};

export const editById = async (req, res, next) => {
  const { _id, newTodo } = req.body;
  
  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: _id },
      { $set: { 
          todo: newTodo.todo,
          tag: newTodo.tag
        } 
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    
    const fileName = req.params.fileName;
    
    const filePath = path.join(__dirname, '../../uploads/', fileName);

    res.download(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: 'File not found or error downloading' });
      }
    });
  } catch (error) {
    res.status(500).json({error});
  }
};

export const search = async (req, res, next) => {
  const { key, userId } = req.params;
  
  try {
    const todos = await Todo.find({ userId: userId, todo: { $regex: key, $options: 'i' } });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Todo.distinct("tag");
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByTag = async (req, res, next) => {
  const { tag, userId } = req.params;
  try {
    const todos = await Todo.find({ userId: userId, tag: tag });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploads = async (req, res, next) => {
  try {
    console.log("asdadada");
    const imgName = req.params.img;
    const imgPath = path.join(__dirname, '..', '..', 'uploads', imgName);

    // Check if the file exists
    if (fs.existsSync(imgPath)) {
      // Set the appropriate content type
      const ext = path.extname(imgName).toLowerCase();
      const contentType = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      }[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);

      // Stream the file
      const stream = fs.createReadStream(imgPath);
      stream.pipe(res);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Internal Server Error');
  }
};

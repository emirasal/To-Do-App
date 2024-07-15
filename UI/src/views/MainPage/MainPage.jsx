import React, { useState, useEffect } from 'react';
import './MainPage.css';
import newRequest from "../../utils/newRequest";  

const MainPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchParameters = async () => {
    try {
  
      const response = await newRequest.get('todo/getAll');
      
      const parametersWithImageUrls = response.data.map(param => ({
        ...param,
        imageUrl: param.img ? `http://localhost:8000/api/todo/uploads/${param.img}` : null
      }));
      
      setParameters(parametersWithImageUrls);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await newRequest.get('todo/getTags');
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagClick = async (tag) => {
    if (tag === selectedTag) {
      setSelectedTag(null);
      fetchParameters();
    } else {
      setSelectedTag(tag);
      try {

        const response = await newRequest.get(`todo/getByTag/${tag}`);
        
        setParameters(response.data);
      } catch (error) {
        console.error('Error fetching parameters by tag:', error);
      }
    }
  };

  const handleSearch = async () => {
    
    try {
      const response = await newRequest.get(`todo/search/${searchTerm}`);
      setParameters(response.data);
    } catch (error) {
      console.error('Error searching parameters:', error);
    }
  };

  const addParameter = async () => {
    try {
      
      const todoInput = document.getElementById('todoInput');
      const tagInput = document.getElementById('tagInput');
      const thumbnailInput = document.getElementById('thumbnailUpload');
      const fileInput = document.getElementById('fileUpload');

      const todo = todoInput.value.trim();
      const tag = tagInput.value.trim();
      const thumbnail = thumbnailInput.files[0];
      const file = fileInput.files[0];

      if (!todo) {
        alert('Todo field cannot be empty.');
        return;
      }

      if (thumbnail) {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowedExtensions.exec(thumbnail.name)) {
          alert('Please upload only img');
          thumbnailInput.value = '';
          return;
        }
      }

      const formData = new FormData();
      formData.append('todo', todo);
      formData.append('tag', tag);

      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      if (file) {
        formData.append('file', file);
      }

      await newRequest.post('todo/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchParameters();
      await fetchTags();
    
      todoInput.value = '';
      tagInput.value = '';
      thumbnailInput.value = '';
      fileInput.value = '';
    } catch (error) {
      console.error('Error adding parameter:', error);
    }
  };

  const deleteParameter = async (parameter) => {
    
    try {
      await newRequest.delete(`todo/deleteById/${parameter._id}`);
      await fetchParameters();
    } catch (error) {
      console.error('Error deleting parameter:', error);
    }
  };

  const editParameter = (parameter) => {
    setEditMode(parameter._id);
  };

  const submitEditParameter = async (parameter) => {
    try {
      const todoInput = document.querySelector(`input[data-id="${parameter._id}"][data-field="todo"]`);
      const tagInput = document.querySelector(`input[data-id="${parameter._id}"][data-field="tag"]`);


      const newTodo = {
        todo: todoInput.value,
        tag: tagInput.value
      };

      await newRequest.put(`todo/editById/${parameter._id}`, newTodo);
      setEditMode(null);
      await fetchTags();
      await fetchParameters();
    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await newRequest.post('auth/logout');
      localStorage.removeItem('currentUser');
      window.location.reload();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const toggleDropdown = () => {
    console.log('All cookies:', document.cookie);
    setShowDropdown(!showDropdown);
  };

  const handleDownload = async (filename) => {
    const downloadUrl = `http://localhost:8000/api/todo/downloadFile/${filename}`;
    try {
      const response = await newRequest.get(downloadUrl, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    fetchParameters();
    fetchTags();
  }, []);

  return (
    <div>
      <div className="header">
        <img src="logo.png" alt="Playable Factory" className="site-logo" />
        <img src="user.png" alt="User" onClick={toggleDropdown} className="user-icon" />
        {showDropdown && (
          <div className="dropdown">
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>
      <div className="content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>
        <div className="tags-container">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="parameter-container">
          <table className="parameter-table">
            <thead>
              <tr>
                <th className="parameter-thumbnail">Thumbnail</th>
                <th className="parameter-key">To-do</th>
                <th className="parameter-tag">Tag</th>
                <th className="parameter-file">File</th>
                <th className="parameter-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map(parameter => {
                return (
                  <tr key={parameter._id}>
                    {editMode === parameter._id ? (
                      <>
                        <td className="parameter-thumbnail">
                          {parameter.thumbnail ? <img src={parameter.thumbnail} alt="Thumbnail" /> : 'No image'}
                        </td>
                        <td className="parameter-key">
                          <input
                            type="text"
                            defaultValue={parameter.todo}
                            data-id={parameter._id}
                            data-field="todo"
                          />
                        </td>
                        <td className="parameter-tag">
                          <input
                            type="text"
                            defaultValue={parameter.tag || ''}
                            data-id={parameter._id}
                            data-field="tag"
                          />
                        </td>
                        <td className="parameter-file">
                          {parameter.file ? (
                            <>
                              {parameter.file}
                              <button className="download-button" onClick={() => handleDownload(parameter.file)}>↓</button>
                            </>
                          ) : 'No File'}
                        </td>
                        <td className="parameter-actions">
                          <button onClick={() => submitEditParameter(parameter)} className="submit-button">Submit</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="parameter-file">
                          {parameter.imageUrl ? (
                            <img style={{ width: '200px', height: '100px' }} src={parameter.imageUrl} alt="File Image" />
                          ) : (
                            'No image'
                          )}
                        </td>
                        <td className="parameter-key">{parameter.todo}</td>
                        <td className="parameter-tag">{parameter.tag || ''}</td>
                        <td className="parameter-file">
                          {parameter.file ? (
                            <>
                              {parameter.file}
                              <button className="download-button" onClick={() => handleDownload(parameter.file)}>↓</button>
                            </>
                          ) : 'No File'}
                        </td>
                        <td className="parameter-actions">
                          <div className="action-buttons">
                            <button onClick={() => editParameter(parameter)} className="edit-button">Edit</button>
                            <button onClick={() => {
                              console.log('Deleting parameter with _id:', parameter._id);
                              deleteParameter(parameter);
                            }} className="delete-button">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="new-parameter-container">
          <h1>Add a new To-do</h1>
          <table className="parameter-table">
            <thead>
              <tr>
                <th className="parameter-thumbnail">Thumbnail</th>
                <th className="parameter-key">To-do</th>
                <th className="parameter-tag">Tag</th>
                <th className="parameter-file">File</th>
                <th className="parameter-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="parameter-thumbnail">
                  <input
                    type="file"
                    id="thumbnailUpload"
                    accept=".jpg,.jpeg,.png"
                  />
                </td>
                <td className="parameter-key">
                  <input
                    type="text"
                    id="todoInput"
                    style={{ height: '20px', marginTop: '12px' }}
                    placeholder="Enter to-do"
                  />
                </td>
                <td className="parameter-tag">
                  <input
                    type="text"
                    id="tagInput"
                    style={{ height: '20px', marginTop: '12px' }}
                    placeholder="Enter tag"
                  />
                </td>
                <td className="parameter-file">
                  <input
                    type="file"
                    id="fileUpload"
                  />
                </td>
                <td className="parameter-actions">
                  <button onClick={addParameter} className="add-parameter-button">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
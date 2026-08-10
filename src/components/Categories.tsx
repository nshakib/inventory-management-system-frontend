import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Categories = () => {
      const [categoryName, setCategoryName] = useState('')
      const [categoryDescription, setCategoryDescription] = useState('')
      const [categories, setCategories] = useState([]);
      const [loading, setLoading] = useState(true);
      const [editCategory, setEditCategory] = useState(null);


      const fetchCategories = async() =>{
            setLoading(true);
            try {
                  const response = await axios.get("http://localhost:5002/api/category/get",
                        {
                              headers:{
                                    Authorization : `Bearer ${localStorage.getItem('pos-token')}`,
                              }
                        });

                        setCategories(response.data.categories);
                        setLoading(false);
            } catch (error) {
                  console.error("Error fecthing categories", error);
                  setLoading(false);
            }
      }

      useEffect(()=>{
            fetchCategories();
      },[])

      const handleSubmit = async(e: React.FormEvent) =>{
            e.preventDefault();

            if(editCategory){
                  const response = await axios.put(`http://localhost:5002/api/category/${editCategory}`,
                        {categoryName, categoryDescription},
                        {
                              headers:{
                                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                              },
                        }
                  );
                  if(response.data.success){
                        setEditCategory(null);
                        alert("Category updated successfully");
                        fetchCategories(); //refresh category list
                  }else{
                        console.error("Error updating category");
                        alert("Error updating category. Please try again")
                  }
            }else{
                  const response = await axios.post("http://localhost:5002/api/category/add",
                        {categoryName, categoryDescription},
                        {
                              headers:{
                                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                              },
                        }
                  );
                  if(response.data.success){
                        setCategoryName("");
                        setCategoryDescription("");
                        alert("Category add successfully");
                        fetchCategories(); //refresh category list
                  }else{
                        console.error("Error adding category");
                        alert("Error adding category. Please try again")
                  }
            }
      }

      // edit
      const handleEdit = async(category) =>{
            setEditCategory(category._id);
            setCategoryName(category.categoryName);
            setCategoryDescription(category.categoryDescription);
      }

      const handleCancel = async() =>{
            setEditCategory(null);
            setCategoryName("");
            setCategoryDescription("");
      }

      const handleDelete = async(id) =>{
            const confirmDelete = window.confirm("Are you sure want to delete this categoty");
            if(confirmDelete){
                  try {
                        const response = await axios.delete(`http://localhost:5002/api/category/${id}`,
                              {
                                    headers: {
                                          Authorization : `Bearer ${localStorage.getItem("pos-token")}`,
                                    },
                              }
                        );
                        if(response.data.success){
                              alert("Category Delete successfully");
                              fetchCategories();
                        }else{
                              console.error("Error deleting category",data);
                              alert("Error deleting category");
                        }
                  } catch (error) {
                        if(error.response.data.message){
                              alert(error.response.data.message);
                        }else{
                              alert("Error deleting category. Please try again")
                        }
                  }
            }
      }

      if(loading) return <div>Loading....</div>
  return (
      <div className='p-4'>
            <h1 className='text-2xl font-bold mb-8'>Category Management</h1>
            <div className='flex flex-col lg:flex-row gap-4'>
                  <div className='lg:w-1/3'>
                        <div className='bg-white shadow-md rounded-lg p-4'>
                              <h2 className='text-center text-xl font-bold mb-4'>{editCategory? "Edit Category" : "Add Category"}</h2>
                              <form className='space-y-4' onSubmit={handleSubmit}>
                                    <div>
                                          <input
                                          value={categoryName}
                                          onChange={(e)=>setCategoryName(e.target.value)}
                                          type="text" 
                                          placeholder='Category Name' 
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div>
                                          <input 
                                          value={categoryDescription}
                                          onChange={(e)=>setCategoryDescription(e.target.value)}
                                          type="text" 
                                          placeholder='Category Description' 
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div className='flex space-x-2'>
                                          <button 
                                          type='submit'
                                          className='w-full mt-2 rounded-md bg-green-500 text-white p-3
                                                      cursor-pointer hover:bg-green-600'
                                          >{editCategory? "Update Category" : "Add Category"}</button>
                                          {
                                                editCategory &&(
                                                      <button
                                                      type='button'
                                                      className='w-full mt-2 rounded-md bg-red-500 text-white p-3
                                                      cursor-pointer hover:bg-red-600'
                                                      onClick={handleCancel}>
                                                            Cancel
                                                      </button>
                                                )
                                          }
                                    </div>
                              </form>
                        </div>
                  </div>
                  <div className='lg:w-2/3'>
                        <div className='bg-white shadow-md rounded-lg p-4'>
                              <table className='w-full border-collapse border border-gray-200'>
                                    <thead>
                                          <tr className='bg-gray-100'>
                                                <th className='border border-gray-200 p-2'>SL: No</th>
                                                <th className='border border-gray-200 p-2'>Category Name</th>
                                                {/* <th className='border border-gray-200 p-2'>Description</th> */}
                                                <th className='border border-gray-200 p-2'>Action</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {categories.map((category,index)=>(
                                                <tr key={index}>
                                                      <td className='border border-gray-200 p-2'>{index +1}</td>
                                                      <td className='border border-gray-200 p-2'>{category.categoryName}</td>
                                                      {/* <td className='border border-gray-200 p-2'>{category.categoryDescription}</td> */}
                                                      <td className='border border-gray-200 p-2'>
                                                            <button onClick={() => handleEdit(category)} className='bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mr-2'>Edit</button>
                                                            <button onClick={()=>handleDelete(category._id)} className='bg-red-500 text-white p-2 rounded-md hover:bg-red-600'>Delete</button>
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </div>
                  </div>
            </div>
            
      </div>
  )
}

export default Categories
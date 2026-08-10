import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface User  {
    id: string;
    name: string;
    email: string;
    password: string;
    address: string;
    role: string;
}

const Users = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address:"",
        role: "",
    });
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchUsers = async() =>{
        setLoading(true);
        try {
                const response = await axios.get("http://localhost:5002/api/users",
                    {
                            headers:{
                                Authorization : `Bearer ${localStorage.getItem('pos-token')}`,
                            }
                    });

                    setUsers(response.data.users);
                    setFilteredUsers(response.data.users);
                    setLoading(false);
        } catch (error) {
                console.error("Error fetching users", error);
                setLoading(false);
        }
    }

        useEffect(()=>{
            fetchUsers();
        },[])

        const handleSubmit = async(e: React.FormEvent) =>{
            e.preventDefault();
            const response = await axios.post("http://localhost:5002/api/users/add",
                formData,
                {
                        headers:{
                            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                        },
                }
            );
            if(response.data.success){
                alert("User add successfully");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    address:"",
                    role: "",
                });
                fetchUsers(); //refresh user list
            }else{
                console.error("Error adding user");
                alert("Error adding user. Please try again")
            }
        }
        const handleDelete = async(id) =>{
            const confirmDelete = window.confirm("Are you sure want to delete this user");
            if(confirmDelete){
                    try {
                        const response = await axios.delete(`http://localhost:5002/api/users/${id}`,
                                {
                                    headers: {
                                            Authorization : `Bearer ${localStorage.getItem("pos-token")}`,
                                    },
                                }
                        );
                        if(response.data.success){
                                alert("User Delete successfully");
                                fetchUsers();
                        }else{
                                console.error("Error deleting user");
                                alert("Error deleting user");
                        }
                    } catch (error) {
                        console.error("Error fetching user", error);
                        alert("Error deleting user. Please try again")
                    }
            }
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        };

        const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
          const searchUser = e.target.value.toLowerCase();
          setFilteredUsers(
            users.filter((user) =>
              user.name.toLowerCase().includes(searchUser)
            )
          );
        };

        if(loading) return <div>Loading....</div>
  return (
    <div className='p-4'>
            <h1 className='text-2xl font-bold mb-8'>Users Management</h1>
            <div className='flex flex-col lg:flex-row gap-4'>
                  <div className='lg:w-1/3'>
                        <div className='bg-white shadow-md rounded-lg p-4'>
                              <h2 className='text-center text-xl font-bold mb-4'>Add User</h2>
                              <form className='space-y-4' onSubmit={handleSubmit}>
                                    <div>
                                          <input
                                          name='name'
                                          onChange={handleChange}
                                          type="text" 
                                          placeholder='Enter Name' 
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div>
                                          <input 
                                          type="email" 
                                          placeholder='Enter Email'
                                          name='email' 
                                          onChange={handleChange}
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div>
                                          <input 
                                          type="password" 
                                          placeholder='Enter Password'
                                          name='password' 
                                          onChange={handleChange}
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div>
                                          <input 
                                          type="address" 
                                          placeholder='Enter Address'
                                          name='address' 
                                          onChange={handleChange}
                                          className='border w-full p-2 rounded-md'/>
                                    </div>
                                    <div>
                                          <select name='role' className='border w-full p-2 rounded-md'
                                           onChange={handleChange} >
                                            <option value="">Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="customer">Customer</option>
                                          </select>
                                    </div>
                                    <div className='flex space-x-2'>
                                          <button 
                                          type='submit'
                                          className='w-full mt-2 rounded-md bg-green-500 text-white p-3
                                                      cursor-pointer hover:bg-green-600'
                                          >Add User</button>
                                    </div>
                              </form>
                        </div>
                  </div>
                  <div className='lg:w-2/3'>
                        <input type="text" placeholder='Search User' className=' border border-gray-300 bg-white w-full p-2 rounded-md mb-4'
                        onChange={handleSearch} />
                        <div className='bg-white shadow-md rounded-lg p-4'>
                              <table className='w-full border-collapse border border-gray-200'>
                                    <thead>
                                          <tr className='bg-gray-100'>
                                                <th className='border border-gray-200 p-2'>SL: No</th>
                                                <th className='border border-gray-200 p-2'>Name</th>
                                                <th className='border border-gray-200 p-2'>Email</th>
                                                <th className='border border-gray-200 p-2'>Address</th>
                                                <th className='border border-gray-200 p-2'>Role</th>
                                                <th className='border border-gray-200 p-2'>Action</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {filteredUsers?.map((user,index)=>(
                                                <tr key={index}>
                                                      <td className='border border-gray-200 p-2'>{index +1}</td>
                                                      <td className='border border-gray-200 p-2'>{user.name}</td>
                                                      <td className='border border-gray-200 p-2'>{user.email}</td>
                                                      <td className='border border-gray-200 p-2'>{user.address}</td>
                                                      <td className='border border-gray-200 p-2'>{user.role}</td>
                                                      <td className='border border-gray-200 p-2'>
                                                            <button onClick={()=>handleDelete(user._id)} 
                                                            className='bg-red-500 text-white p-2 rounded-md hover:bg-red-600'>Delete</button>
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                              {filteredUsers?.length === 0 && <div className='text-center mt-4 font-bold'>No user found</div>}
                        </div>
                  </div>
            </div>
            
      </div>
  )
}

export default Users
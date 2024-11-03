import { create } from "zustand";
import axios from "axios";
import { verifyEmail } from "../../../backend/controllers/authController";


const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
   user:null,
   isAuthenticated:false,
   error:null,
   isLoading: false,
   isCheckingAuth: true,


   signup: async(email, password, name) => {
    set({isLoading:true , error:null});
    try {
        const response = await axios.post(`${API_URL}/signup` , {email, password,name});
        set({user:response.data.user, isAuthenticated:true , isLoading:true})
    } catch (error) {
        set({error:error.response.data.message || "Error Signing up", isLoading:false});
        throw error;
    }
   },


   login: async (email, password) => {
    set({isLoading:true , error:null});
    try {
        const response = await axios.post(`${API_URL}/login` , {email, password});
        set({user:response.data.user, isAuthenticated:true , isLoading:true , error:null})
    } catch (error) {
        set({error:error.response?.data?.message || "invalid credentials", isLoading:false});
        throw error;
    }
   },


   verifyEmail:async (code) => {
    set({ isLoading: true, error: null});
    try {
        const response = await axios.post(`${API_URL}/verify-email`, {code});
        set({ user: response.data.user, isAuthenticated: true, isLoading:false});
        return response.data
    } catch (error) {
        set({error:error.response.data.message || "Error verfying email", isLoading:false});
        throw error;
    }
   },


   checkAuth: async () => {
    set({isCheckingAuth: true, error: null});
    try {
        const response = await axios.get(`${API_URL}/check-auth`)
        set({user: response.data.user, isAuthenticated: true, isCheckingAuth:false});
    } catch (error) {
        set({error: null, isCheckingAuth: false})
    }
   },


   logout: async () => {
    await axios.post(`${API_URL}/logout`);
    set({ user: null, isAuthenticated: false });
    },

}));
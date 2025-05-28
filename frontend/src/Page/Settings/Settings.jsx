import React, { useState, useEffect } from "react";
import {
    User, UserRoundPen, Lock, Mail, Phone, MapPin, Calendar, CheckCircle,
    KeyRound, Save, SlidersHorizontal, ChefHat, Accessibility, School
} from "lucide-react";
import userService from "../../data/Service/userService";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
// import './settings.css';

export default function Settings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
        address: "",
        preferredClass: "first",
        mealPreference: "veg",
        specialAssistance: false,
        password: "",
        confirmPassword: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            if (currentUser && currentUser.userID) {
                try {
                    setIsLoading(true);
                    setError(null);
                    const userData = await userService.getUserByID(currentUser.userID);

                    // Format the date of birth if it exists
                    let formattedDob = userData.DateOfBirth || "";
                    if (userData.DateOfBirth) {
                        const date = new Date(userData.DateOfBirth);
                        formattedDob = date.toISOString().split('T')[0];
                    }

                    setFormData({
                        fullName: userData.UserName || "",
                        gender: userData.Gender?.toLowerCase() || "",
                        dob: formattedDob,
                        email: userData.Email || "",
                        phone: userData.PhoneNumber || "",
                        address: userData.Address || "",
                        preferredClass: userData.PreferredClass || "first",
                        mealPreference: userData.MealPreference || "veg",
                        specialAssistance: userData.SpecialAssistance || false,
                        password: "",
                        confirmPassword: "",
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setError("Failed to load user data. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditing) {
            if (formData.password && formData.password !== formData.confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                // Prepare data for update
                const userUpdateData = {
                    UserName: formData.fullName,
                    Gender: formData.gender,
                    DateOfBirth: formData.dob, // Matching our new DB column name
                    Email: formData.email,
                    PhoneNumber: formData.phone,
                    Address: formData.address, // Matching our new DB column name
                    PreferredClass: formData.preferredClass,
                    MealPreference: formData.mealPreference,
                    SpecialAssistance: formData.specialAssistance
                };

                await userService.updateUser(currentUser.userID, userUpdateData);

                if (formData.password) {
                    await userService.updateUserPassword(currentUser.userID, {
                        newPassword: formData.password
                    });

                    setFormData(prev => ({
                        ...prev,
                        password: "",
                        confirmPassword: ""
                    }));
                }

                setIsEditing(false);
                setShowNotification(true);

                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            } catch (error) {
                console.error("Error updating user data:", error);
                alert("Failed to update profile. Please try again.");
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading user data...</span>
            </div>
        );
    }

    return (
        <div className="animate-fadeInUp max-w-3xl mx-auto p-4 space-y-6">
            <div className="flex justify-around border-b">
                {[
                    {
                        key: "profile",
                        icon: <User className="w-4 h-4" />,
                        label: "Profile"
                    },
                    {
                        key: "preferences",
                        icon: <SlidersHorizontal className="w-4 h-4" />,
                        label: "Preferences"
                    },
                    {
                        key: "security",
                        icon: <Lock className="w-4 h-4" />,
                        label: "Security"
                    }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 ${activeTab === tab.key ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 space-y-6 border border-gray-200">
                {activeTab === "profile" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><User /> Personal Information</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="font-bold mb-1 text-blue-600 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 text-blue-600 flex items-center gap-2">
                                    <UserRoundPen className="w-4 h-4" />
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Mail className="w-4 h-4" /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Phone className="w-4 h-4" /> Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "preferences" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><SlidersHorizontal /> Travel Preferences</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-2">
                                    <School className="w-4 h-4" />
                                    Preferred Class
                                </label>
                                <select
                                    name="preferredClass"
                                    value={formData.preferredClass}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="first">First Class</option>
                                    <option value="second">Second Class</option>
                                    <option value="sleeper">Sleeper</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><ChefHat className="w-4 h-4" /> Meal Preference</label>
                                <select
                                    name="mealPreference"
                                    value={formData.mealPreference}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="veg">Vegetarian</option>
                                    <option value="non-veg">Non-Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="specialAssistance"
                                    checked={formData.specialAssistance}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <label className="flex items-center gap-1"><Accessibility className="w-4 h-4" /> Require Special Assistance</label>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "security" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound /> Security Settings</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-blue-600 font-bold mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-blue-600 font-bold mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4">
                    {isEditing && (
                        <button type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    )}
                    {!isEditing && (
                        <button type="button"
                            onClick={handleEditToggle}
                            className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Change Information
                        </button>
                    )}
                </div>

                {showNotification && (
                    <div
                        className={`mt-4 transition-all duration-700 ease-in-out 
                                    ${showNotification ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'} 
                                bg-green-100 text-green-800 px-4 py-3 rounded-lg shadow text-center`}
                    >
                        Changes have been saved successfully ✅
                    </div>
                )}
            </form>
        </div>
    );
}
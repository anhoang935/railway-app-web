import React, { useState, useEffect } from "react";
import {
    User, UserRoundPen, Lock, Mail, Phone, MapPin, Calendar, CheckCircle,
    KeyRound, Save
    // REMOVED: SlidersHorizontal, ChefHat, Accessibility, School
} from "lucide-react";
import userService from "../../data/Service/userService";
import authService from "../../data/Service/authService";
import { useNavigate } from "react-router-dom";
import "./settings.css";

export default function Settings() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            try {
                setIsLoading(true);

                // Check authentication using authService directly
                const isAuth = authService.isAuthenticated();
                const user = authService.getCurrentUser();

                console.log('Settings - Auth check:', { isAuth, user });

                if (!isAuth || !user) {
                    console.log('Settings - Not authenticated, redirecting to login');
                    navigate('/login');
                    return;
                }

                setCurrentUser(user);

                // Fetch user data from API
                if (user.userId) {
                    try {
                        const userData = await userService.getUserByID(user.userId);

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
                            password: "",
                            confirmPassword: "",
                        });
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        setError("Failed to load user data. Please try again.");
                    }
                }
            } catch (error) {
                console.error("Settings - Auth check failed:", error);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [navigate]);

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
            // Add confirmation dialog
            const isConfirmed = window.confirm("Are you sure you want to save these changes?");
            if (!isConfirmed) {
                return; // Exit if user cancels
            }

            if (formData.password && formData.password !== formData.confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                // Prepare data for update
                const userUpdateData = {
                    UserName: formData.fullName,
                    Gender: formData.gender,
                    DateOfBirth: formData.dob,
                    Email: formData.email,
                    PhoneNumber: formData.phone,
                    Address: formData.address,
                };

                await userService.updateUser(currentUser.userId, userUpdateData);

                if (formData.password) {
                    await userService.updateUserPassword(currentUser.userId, {
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

    // Show loading spinner
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <span className="block mt-3 text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    // Show error if authentication failed
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                    <p className="text-gray-600">Manage your profile and preferences</p>
                </div>

                {/* Success Notification */}
                {showNotification && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={20} />
                        Profile updated successfully!
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <User size={20} />
                        Profile
                    </button>
                    <button
                        className={`tab-button ${activeTab === "security" ? "active" : ""}`}
                        onClick={() => setActiveTab("security")}
                    >
                        <Lock size={20} />
                        Security
                    </button>
                    {/* Remove Preferences tab */}
                </div>

                {/* Form Container */}
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <User size={16} className="inline mr-2" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Mail size={16} className="inline mr-2" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Phone size={16} className="inline mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Calendar size={16} className="inline mr-2" />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="select-input"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* MOVED: Address field inside the grid next to Gender */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MapPin size={16} className="inline mr-2" />
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            rows="2"
                                            className="form-textarea"
                                            placeholder="Enter your address"
                                        />
                                    </div>
                                </div>

                                {/* REMOVED: Separate Address field section */}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <KeyRound size={16} className="inline mr-2" />
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Lock size={16} className="inline mr-2" />
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Password Requirements:</strong>
                                        <br />• At least 8 characters long
                                        <br />• Include uppercase and lowercase letters
                                        <br />• Include at least one number
                                        <br />• Include at least one special character
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Remove the entire Preferences tab section */}

                        {/* Button Container */}
                        <div className="button-container">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={handleEditToggle}
                                    className="button edit-button"
                                >
                                    <UserRoundPen className="icon" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleEditToggle}
                                        className="button bg-gray-500 text-white hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="button save-button"
                                    >
                                        <Save className="icon" />
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
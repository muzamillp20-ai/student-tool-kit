import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  User, Heart, Wrench, Trash2, RotateCcw, Moon, Sun,
  Mail, Phone, MapPin, Briefcase, GraduationCap, Edit3,
  Camera, LogOut, Shield, Check, X, AlertTriangle, Settings
} from 'lucide-react';

export default function ProfilePage() {
  const { theme, toggleTheme, favorites, history, recentlyUsed, clearHistory } = useApp();
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Edit mode states
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [education, setEducation] = useState(user?.education || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveName = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
    }
    setEditingName(false);
  };

  const handleSaveBio = () => {
    updateProfile({ bio: bio.trim() });
    setEditingBio(false);
  };

  const handleSaveDetails = () => {
    updateProfile({ phone, location, occupation, education });
    setEditingDetails(false);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setChangingPassword(false);
      }, 2000);
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your profile</p>
          <Link to="/login" className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User size={22} className="text-indigo-400" />
          Profile
        </h1>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Profile Card */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{getInitials(user.name)}</span>
            </div>
            <button className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Camera size={12} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          </div>

          {/* Name & Email */}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm outline-none flex-1 ${isDark ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-200'}`}
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">
                  <Check size={14} />
                </button>
                <button onClick={() => { setEditingName(false); setName(user.name); }} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <button onClick={() => setEditingName(true)} className={`p-1 rounded ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <Edit3 size={12} />
                </button>
              </div>
            )}
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1.5`}>
              <Mail size={12} />
              {user.email}
              {user.emailVerified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">
                  <Check size={8} /> Verified
                </span>
              )}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Member since {formatDate(user.joinedAt)}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className={`mb-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          {editingBio ? (
            <div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={200}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none resize-none ${isDark ? 'bg-white/10 border border-white/20 text-white' : 'bg-white border border-gray-200'}`}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{bio.length}/200</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBio(false); setBio(user.bio || ''); }} className="px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-400">Cancel</button>
                  <button onClick={handleSaveBio} className="px-3 py-1 rounded-lg text-xs bg-green-500/20 text-green-400">Save</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm ${user.bio ? '' : isDark ? 'text-gray-500 italic' : 'text-gray-400 italic'}`}>
                {user.bio || 'No bio yet. Click edit to add one.'}
              </p>
              <button onClick={() => setEditingBio(true)} className={`p-1 rounded flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Heart size={16} className="text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{favorites.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favorites</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Wrench size={16} className="text-indigo-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{history.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tools Used</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <User size={16} className="text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{recentlyUsed.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recent</p>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <User size={16} className="text-indigo-400" />
            Personal Details
          </h3>
          {!editingDetails && (
            <button onClick={() => setEditingDetails(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            {editingDetails ? (
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
                className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            ) : (
              <span className={`text-sm ${user.phone ? '' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {user.phone || 'Not provided'}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <MapPin size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            {editingDetails ? (
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location"
                className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            ) : (
              <span className={`text-sm ${user.location ? '' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {user.location || 'Not provided'}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Briefcase size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            {editingDetails ? (
              <input
                type="text"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                placeholder="Occupation"
                className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            ) : (
              <span className={`text-sm ${user.occupation ? '' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {user.occupation || 'Not provided'}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <GraduationCap size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            {editingDetails ? (
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="Education"
                className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            ) : (
              <span className={`text-sm ${user.education ? '' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {user.education || 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {editingDetails && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditingDetails(false)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              Cancel
            </button>
            <button onClick={handleSaveDetails} className="flex-1 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings size={16} className="text-indigo-400" />
          Preferences
        </h3>
        
        {/* Theme */}
        <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-yellow-400" />}
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Currently using {isDark ? 'dark' : 'light'} mode
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Clear History */}
        <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-red-400" />
            <div>
              <p className="text-sm font-medium">Clear History</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Remove all tool usage history
              </p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Reset Preferences */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <RotateCcw size={16} className="text-yellow-400" />
            <div>
              <p className="text-sm font-medium">Reset Preferences</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Reset favorites and recent tools
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('ai-hub-favorites');
              localStorage.removeItem('ai-hub-recent');
              window.location.reload();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Security */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Shield size={16} className="text-indigo-400" />
          Security
        </h3>

        {/* Change Password */}
        <div className={`pb-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Last changed: Never
              </p>
            </div>
            <button
              onClick={() => setChangingPassword(!changingPassword)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              {changingPassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {changingPassword && (
            <div className="space-y-3">
              {passwordError && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="text-xs text-red-300">{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check size={12} className="text-green-400" />
                  <span className="text-xs text-green-300">Password changed successfully!</span>
                </div>
              )}
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'}`}
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'}`}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'}`}
              />
              <button
                onClick={handleChangePassword}
                className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              >
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="pt-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
            >
              <AlertTriangle size={14} />
              Delete Account
            </button>
          ) : (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm mb-3 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                Are you sure? This will permanently delete your account and all data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/settings"
          className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
        >
          <Settings size={18} className="text-indigo-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">AI Settings</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Configure AI provider</p>
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>→</span>
        </Link>
        <Link
          to="/favorites"
          className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
        >
          <Heart size={18} className="text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">My Favorites</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{favorites.length} tools saved</p>
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>→</span>
        </Link>
      </div>

      {/* Info */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-indigo-50 border border-indigo-100'}`}>
        <p className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600'}`}>
          💡 All data is stored locally on your device. Your profile information, preferences, and activity history are private and never sent to external servers.
        </p>
      </div>
    </div>
  );
}

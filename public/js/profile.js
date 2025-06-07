// Profile page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    loadUserData();
    setupProfileForm();
});

// Load current user data into the display and form
function loadUserData() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }
    
    // Update display elements
    document.getElementById('display-name').textContent = user.name || 'Unknown User';
    document.getElementById('display-email').textContent = user.email || 'No email';
    
    // Update profile photo
    const profilePhoto = document.getElementById('profile-photo');
    if (user.profile_img && user.profile_img.trim() !== '') {
        profilePhoto.src = user.profile_img;
        profilePhoto.onerror = () => {
            profilePhoto.src = 'https://via.placeholder.com/150/28a745/ffffff?text=' + encodeURIComponent(user.name ? user.name.charAt(0).toUpperCase() : 'U');
        };
    } else {
        profilePhoto.src = 'https://via.placeholder.com/150/28a745/ffffff?text=' + encodeURIComponent(user.name ? user.name.charAt(0).toUpperCase() : 'U');
    }
    
    // Update role badge
    const roleBadge = document.getElementById('display-role');
    const roleText = user.role || 'User';
    roleBadge.textContent = roleText;
    
    // Set badge color based on role
    roleBadge.className = 'badge mb-4';
    if (roleText.toLowerCase() === 'admin') {
        roleBadge.classList.add('bg-danger');
    } else if (roleText.toLowerCase() === 'moderator') {
        roleBadge.classList.add('bg-warning');
    } else {
        roleBadge.classList.add('bg-primary');
    }
    
    // Populate form fields (for when edit form is shown)
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('profile-image-url').value = user.profile_img || '';
    
    // Clear password fields
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Show the edit form
function showEditForm() {
    document.getElementById('profile-display').classList.add('d-none');
    document.getElementById('profile-edit').classList.remove('d-none');
    
    // Pre-populate form with current user data
    const user = getCurrentUser();
    if (user) {
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        
        // Clear image inputs (user should select new image if they want to change)
        document.getElementById('profile-image-url').value = '';
        document.getElementById('profile-image-file').value = '';
        
        // Clear password fields (security - never pre-populate passwords)
        document.getElementById('password').value = '';
        document.getElementById('confirm-password').value = '';
    }
}

// Hide the edit form
function hideEditForm() {
    document.getElementById('profile-edit').classList.add('d-none');
    document.getElementById('profile-display').classList.remove('d-none');
    
    // Clear any alerts
    document.getElementById('profile-alerts').innerHTML = '';
}

// Setup profile form submission
function setupProfileForm() {
    const form = document.getElementById('profile-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
    
    // Add image preview functionality
    const fileInput = document.getElementById('profile-image-file');
    fileInput.addEventListener('change', previewImage);
}

// Preview selected image
function previewImage(event) {
    const file = event.target.files[0];
    console.log('File selected in preview:', file);
    
    if (file) {
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('Invalid file type:', file.type);
            showAlert('Please select a valid image file.', 'danger');
            event.target.value = '';
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            console.log('File too large:', file.size);
            showAlert('Image size must be less than 5MB.', 'danger');
            event.target.value = '';
            return;
        }
        
        console.log('File validation passed, creating preview');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('FileReader loaded, updating preview');
            // Update the profile photo preview
            const profilePhoto = document.getElementById('profile-photo');
            if (profilePhoto) {
                profilePhoto.src = e.target.result;
                console.log('Preview image updated');
            }
        };
        reader.readAsDataURL(file);
        
        // Clear URL input if file is selected
        document.getElementById('profile-image-url').value = '';
        console.log('URL input cleared');
    } else {
        console.log('No file selected');
    }
}

// Update user profile
async function updateProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    const formData = new FormData(document.getElementById('profile-form'));
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    const fileInput = document.getElementById('profile-image-file');
    const profileImageFile = fileInput.files[0];
    const profileImageUrl = document.getElementById('profile-image-url').value;
    
    console.log('Form submission - file input:', fileInput);
    console.log('Form submission - files array:', fileInput.files);
    console.log('Form submission - selected file:', profileImageFile);
    console.log('Form submission - profile URL:', profileImageUrl);
    
    // Validate form
    if (!name || !email) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Validate password if provided
    if (password && password !== confirmPassword) {
        showAlert('Passwords do not match.', 'danger');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    try {
        let finalProfileImg = user.profile_img;
        
        // Handle file upload first if a file is selected
        if (profileImageFile) {
            console.log('File selected for upload:', profileImageFile.name, profileImageFile.size);
            showAlert('Uploading image...', 'info');
            
            const uploadFormData = new FormData();
            uploadFormData.append('profileImage', profileImageFile);
            uploadFormData.append('userId', user.id);
            
            console.log('Sending upload request with userId:', user.id);
            
            const uploadResponse = await fetch('/api/auth/upload-profile-image', {
                method: 'POST',
                body: uploadFormData
            });
            
            console.log('Upload response status:', uploadResponse.status);
            const uploadResult = await uploadResponse.json();
            console.log('Upload result:', uploadResult);
            
            if (uploadResponse.ok) {
                finalProfileImg = uploadResult.imagePath;
                console.log('Image uploaded successfully, path:', finalProfileImg);
                showAlert('Image uploaded successfully!', 'success');
            } else {
                console.error('Upload failed:', uploadResult);
                showAlert(uploadResult.error || 'Failed to upload image.', 'danger');
                return;
            }
        } else if (profileImageUrl && profileImageUrl.trim() !== '') {
            // Use URL if provided and no file uploaded
            console.log('Using URL instead of file upload:', profileImageUrl);
            finalProfileImg = profileImageUrl;
        }
        
        const updateData = {
            name: name,
            email: email,
            profile_img: finalProfileImg
        };
        
        // Only include password if it's provided
        if (password && password.trim() !== '') {
            updateData.password = password;
        }
        
        const response = await fetch(`/api/auth/profile/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Update localStorage with new user data
            const updatedUser = {
                ...user,
                name: name,
                email: email,
                profile_img: finalProfileImg
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            showAlert('Profile updated successfully!', 'success');
            
            // Update navigation to reflect new name
            updateNavigation();
            
            // Refresh the display with new data
            loadUserData();
            
            // Hide edit form and show display
            setTimeout(() => {
                hideEditForm();
            }, 2000);
            
            // Clear form fields
            document.getElementById('password').value = '';
            document.getElementById('confirm-password').value = '';
            document.getElementById('profile-image-file').value = '';
            document.getElementById('profile-image-url').value = '';
        } else {
            showAlert(result.error || 'Failed to update profile.', 'danger');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('An error occurred while updating your profile.', 'danger');
    }
}

// Show alert message
function showAlert(message, type) {
    const alertsContainer = document.getElementById('profile-alerts');
    const alertId = 'alert-' + Date.now();
    
    const getIcon = (type) => {
        switch(type) {
            case 'success': return 'check-circle';
            case 'info': return 'info-circle';
            case 'danger': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    };
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${getIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertsContainer.innerHTML = alertHtml;
    
    // Auto-dismiss success alerts after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
} 
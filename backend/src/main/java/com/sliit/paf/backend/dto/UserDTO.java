package com.sliit.paf.backend.dto;

import java.util.Set;

public class UserDTO {
    private String id;
    private String email;
    private String name;
    private String picture;
    private Set<String> roles;
    private boolean active;
    private String provider;

    // Extended profile
    private String bio;
    private String department;
    private String jobTitle;
    private String officeLocation;
    private String phoneNumbers;
    private String website;
    private String linkedIn;
    private String emergencyContact;
    private String emergencyPhone;

    public UserDTO() {}

    public UserDTO(String id, String email, String name, String picture,
                   Set<String> roles, boolean active) {
        this.id = id; this.email = email; this.name = name;
        this.picture = picture; this.roles = roles; this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }
    public String getPhoneNumbers() { return phoneNumbers; }
    public void setPhoneNumbers(String phoneNumbers) { this.phoneNumbers = phoneNumbers; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getLinkedIn() { return linkedIn; }
    public void setLinkedIn(String linkedIn) { this.linkedIn = linkedIn; }
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }
}
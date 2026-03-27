package com.sliit.paf.backend.dto;

import java.util.Set;

public class UserDTO {
    private String id;
    private String email;
    private String name;
    private String picture;
    private Set<String> roles;
    private boolean active;

    public UserDTO() {}

    public UserDTO(String id, String email, String name, String picture,
                   Set<String> roles, boolean active) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.roles = roles;
        this.active = active;
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
}
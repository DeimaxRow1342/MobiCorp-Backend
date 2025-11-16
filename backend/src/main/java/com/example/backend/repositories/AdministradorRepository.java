package com.example.backend.repositories;

import com.example.backend.models.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    Administrador findByEmail(String email);
}

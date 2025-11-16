package com.example.backend.services;

import com.example.backend.models.Administrador;
import com.example.backend.repositories.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdministradorService {

    @Autowired
    private AdministradorRepository administradorRepository;

    public Administrador crearAdministrador(Administrador admin) {
        return administradorRepository.save(admin);
    }

    public List<Administrador> obtenerTodos() {
        return administradorRepository.findAll();
    }

    public Administrador obtenerPorId(Long id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado."));
    }

    public Administrador obtenerPorEmail(String email) {
        return administradorRepository.findByEmail(email);
    }

    public void eliminar(Long id) {
        administradorRepository.deleteById(id);
    }
}

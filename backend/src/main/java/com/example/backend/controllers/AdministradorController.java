package com.example.backend.controllers;

import com.example.backend.models.Administrador;
import com.example.backend.services.AdministradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdministradorController {

    @Autowired
    private AdministradorService administradorService;

    @PostMapping
    public Administrador crear(@RequestBody Administrador admin) {
        return administradorService.crearAdministrador(admin);
    }

    @GetMapping
    public List<Administrador> listar() {
        return administradorService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public Administrador obtener(@PathVariable Long id) {
        return administradorService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {
        administradorService.eliminar(id);
        return "Administrador eliminado";
    }
}

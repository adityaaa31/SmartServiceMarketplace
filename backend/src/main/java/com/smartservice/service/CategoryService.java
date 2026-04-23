package com.smartservice.service;

import com.smartservice.dto.response.CategoryResponse;
import com.smartservice.entity.Category;
import com.smartservice.exception.BadRequestException;
import com.smartservice.exception.ResourceNotFoundException;
import com.smartservice.repository.CategoryRepository;
import com.smartservice.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(Map<String, Object> request) {
        String name = (String) request.get("name");
        if (categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category with name '" + name + "' already exists");
        }

        Category category = Category.builder()
                .name(name)
                .description((String) request.get("description"))
                .icon((String) request.get("icon"))
                .imageUrl((String) request.get("imageUrl"))
                .build();

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, Map<String, Object> updates) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (updates.containsKey("name")) category.setName((String) updates.get("name"));
        if (updates.containsKey("description")) category.setDescription((String) updates.get("description"));
        if (updates.containsKey("icon")) category.setIcon((String) updates.get("icon"));
        if (updates.containsKey("imageUrl")) category.setImageUrl((String) updates.get("imageUrl"));
        if (updates.containsKey("active")) category.setActive((Boolean) updates.get("active"));

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .imageUrl(category.getImageUrl())
                .active(category.isActive())
                .serviceCount(category.getServices().size())
                .build();
    }
}

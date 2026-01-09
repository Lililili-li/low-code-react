# Design Document: Dark Mode Navigation Menu Enhancement

## Overview

This design enhances the existing Menu component (`apps/web/src/components/Menu.tsx`) to provide a refined dark mode experience. The enhancement focuses on improving visual hierarchy, interaction states, and overall aesthetics while maintaining the existing component structure and functionality. The implementation will use Tailwind CSS utility classes and the existing design token system to ensure consistency with the application's theme.

## Architecture

The enhancement follows a CSS-first approach, modifying only the styling classes within the existing Menu component. No architectural changes are required since the component structure already supports the necessary functionality.

**Component Structure:**
- The Menu component remains a recursive tree structure
- Styling changes are applied through Tailwind utility classes
- The existing state management (openKeys, active states) is preserved
- Theme integration uses the existing CSS custom properties from the design system

## Components and Interfaces

### Menu Component Enhancement

The Menu component interface remains unchanged. Only the className strings within the component will be modified.

**Existing Interface (No Changes):**
```typescript
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

interface MenuProps {
  items: MenuItem[];
  defaultOpenKeys?: string[];
  className?: string;
  activeKey?: string;
  onSelect?: (key: string) => void;
}
```

### Styling Modifications

**Active State Styling:**
- Primary color: `text-primary` (maps to blue in dark mode)
- Font weight: `font-medium`
- Background for child items: `bg-accent` with enhanced darkness

**Hover State Styling:**
- Background: `hover:bg-accent` (subtle gray background)
- Text color: `hover:text-accent-foreground`
- Transition: `transition-colors duration-200`

**Inactive State Styling:**
- Text color: `text-muted-foreground` (muted gray)
- No background

**Nested Item Styling:**
- Indentation: `pl-8` (32px left padding for depth > 0)
- Additional spacing: `mt-1 space-y-1` for nested lists

## Data Models

No data model changes are required. The existing MenuItem interface and component state structure remain unchanged.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Active State Visual Distinction
*For any* menu item in the active state, the rendered element should have the `text-primary` and `font-medium` classes applied, ensuring it is visually distinct from inactive items.

**Validates: Requirements 1.1, 1.2**

### Property 2: Hover State Consistency
*For any* inactive menu item, when the hover state is applied, the element should have both `hover:bg-accent` and `hover:text-accent-foreground` classes, ensuring consistent hover feedback across all menu items.

**Validates: Requirements 2.1, 2.2**

### Property 3: Nested Item Indentation
*For any* menu item with depth greater than 0, the rendered element should have the `pl-8` class applied, ensuring proper visual hierarchy.

**Validates: Requirements 3.1**

### Property 4: Transition Smoothness
*For any* menu item, the element should have the `transition-colors` class applied, ensuring smooth visual transitions between states.

**Validates: Requirements 5.2, 5.3**

### Property 5: Chevron Rotation Animation
*For any* expandable menu item, when toggled between open and closed states, the chevron icon should have the `transition-transform` class and conditionally apply `rotate-180` based on the open state.

**Validates: Requirements 5.1**

### Property 6: Spacing Consistency
*For any* menu item, the rendered element should have `px-3 py-2` classes for consistent padding, and the container should have `gap-2` for consistent spacing between icon and label.

**Validates: Requirements 6.1, 6.2**

## Error Handling

No error handling changes are required since this is a pure styling enhancement. The existing component error handling remains sufficient.

## Testing Strategy

### Unit Tests

Unit tests will verify that the correct CSS classes are applied based on component state:

1. **Active State Classes**: Verify that active items receive `text-primary` and `font-medium` classes
2. **Hover State Classes**: Verify that inactive items have `hover:bg-accent` and `hover:text-accent-foreground` classes
3. **Nested Item Classes**: Verify that nested items (depth > 0) receive `pl-8` class
4. **Transition Classes**: Verify that all items have `transition-colors` class
5. **Chevron Animation Classes**: Verify that expandable items have chevron with `transition-transform` and conditional `rotate-180`

### Property-Based Tests

Property-based tests will verify that styling rules hold across all possible menu configurations:

1. **Property Test 1**: For randomly generated menu trees, verify all active items have correct active state classes
2. **Property Test 2**: For randomly generated menu trees, verify all inactive items have correct hover state classes
3. **Property Test 3**: For randomly generated menu trees with varying depths, verify all nested items have correct indentation classes
4. **Property Test 4**: For randomly generated menu trees, verify all items have transition classes
5. **Property Test 5**: For randomly generated menu trees with expandable items, verify chevron animation classes are correctly applied
6. **Property Test 6**: For randomly generated menu trees, verify all items have consistent spacing classes

**Testing Framework**: Vitest with @testing-library/react for component testing, fast-check for property-based testing

**Test Configuration**: Minimum 100 iterations per property test to ensure comprehensive coverage across different menu structures.

### Visual Regression Testing

While not automated in this spec, manual visual testing should verify:
- Color contrast meets WCAG AA standards (4.5:1 minimum)
- Hover states are visually distinct
- Active states are clearly identifiable
- Animations are smooth and not jarring

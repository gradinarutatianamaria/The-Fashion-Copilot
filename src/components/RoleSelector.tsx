import React from 'react';
import { FashionRole } from '../types';

interface RoleSelectorProps {
  activeRole: FashionRole;
  setActiveRole: (role: FashionRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  activeRole,
  setActiveRole,
}) => {
  const roles: Array<{ id: FashionRole; label: string; code: string }> = [
    { id: 'all', label: 'Omni', code: 'SYS.01' },
    { id: 'stylist', label: 'Stylist', code: 'SYS.02' },
    { id: 'trend_researcher', label: 'Forecaster', code: 'SYS.03' },
    { id: 'brand_strategist', label: 'Brand', code: 'SYS.04' },
    { id: 'editor', label: 'Editor', code: 'SYS.05' },
    { id: 'creative_director', label: 'Creative', code: 'SYS.06' },
    { id: 'all_star_panel', label: '5-Board', code: 'SYS.07' },
  ];

  return (
    <div className="nav-group">
      <p className="label mb-2">Expert Vectors</p>
      <div className="expert-chips">
        {roles.map((r) => {
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              id={`chip-vector-${r.id}`}
              onClick={() => setActiveRole(r.id)}
              className={`chip ${isActive ? 'active' : ''}`}
              title={`${r.label} Protocol (${r.code})`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

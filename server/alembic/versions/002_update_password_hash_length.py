"""Increase password_hash field length

Revision ID: 002_update_password_hash_length
Revises: ee2e2d505dc1
Create Date: 2025-12-19 20:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_update_password_hash_length'
down_revision: Union[str, Sequence[str], None] = 'ee2e2d505dc1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - increase password_hash field length."""
    # Alter the password_hash column in the user table to allow longer values
    op.alter_column('user', 'password_hash',
                    type_=sa.String(255),
                    existing_type=sa.String(120))


def downgrade() -> None:
    """Downgrade schema - decrease password_hash field length."""
    # Downgrade would change it back, but this might cause data loss
    # Only downgrade if you're sure the data fits in 120 characters
    op.alter_column('user', 'password_hash',
                    type_=sa.String(120),
                    existing_type=sa.String(255))
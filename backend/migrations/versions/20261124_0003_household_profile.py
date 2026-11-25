"""add household profile fields

Revision ID: 20261124_0003
Revises: 20260914_0002
Create Date: 2026-11-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20261124_0003"
down_revision = "20260914_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user_profiles", sa.Column("household_size", sa.Integer(), nullable=False, server_default="2"))
    op.add_column("user_profiles", sa.Column("preferred_cuisines", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("user_profiles", sa.Column("dietary_preferences", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("user_profiles", sa.Column("allergies", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("user_profiles", sa.Column("cooking_skill", sa.String(length=40), nullable=False, server_default="Intermediate"))
    op.add_column("user_profiles", sa.Column("max_prep_minutes", sa.Integer(), nullable=False, server_default="30"))


def downgrade() -> None:
    op.drop_column("user_profiles", "max_prep_minutes")
    op.drop_column("user_profiles", "cooking_skill")
    op.drop_column("user_profiles", "allergies")
    op.drop_column("user_profiles", "dietary_preferences")
    op.drop_column("user_profiles", "preferred_cuisines")
    op.drop_column("user_profiles", "household_size")

"""add waste_logs table

Revision ID: 20261124_0005
Revises: 20261124_0004
Create Date: 2026-11-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20261124_0005"
down_revision = "20261124_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "waste_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("item_name", sa.String(length=120), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("unit", sa.String(length=40), nullable=False, server_default="pcs"),
        sa.Column("estimated_value", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("co2_kg", sa.Float(), nullable=False, server_default="0.5"),
        sa.Column("reason", sa.String(length=120), nullable=False, server_default="Spoiled / Expired"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("waste_logs")

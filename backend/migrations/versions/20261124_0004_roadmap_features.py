"""add roadmap features tables and columns

Revision ID: 20261124_0004
Revises: 20261124_0003
Create Date: 2026-11-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20261124_0004"
down_revision = "20261124_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("pantry_items", sa.Column("location", sa.String(length=80), nullable=False, server_default="Home"))
    op.add_column("user_profiles", sa.Column("notify_email_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("user_profiles", sa.Column("notify_push_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("user_profiles", sa.Column("notify_days_threshold", sa.Integer(), nullable=False, server_default="3"))
    op.add_column("user_profiles", sa.Column("notification_email", sa.String(length=255), nullable=False, server_default=""))

    op.create_table(
        "saved_recipes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("cuisine", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("prep_minutes", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("cook_minutes", sa.Integer(), nullable=False, server_default="15"),
        sa.Column("estimated_calories_per_serving", sa.Integer(), nullable=False, server_default="350"),
        sa.Column("estimated_cost", sa.Float(), nullable=False, server_default="10.0"),
        sa.Column("ingredients", sa.JSON(), nullable=False),
        sa.Column("steps", sa.JSON(), nullable=False),
        sa.Column("substitutions", sa.JSON(), nullable=False),
        sa.Column("nutrition_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "household_members",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("member_name", sa.String(length=120), nullable=False),
        sa.Column("member_email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False, server_default="Editor"),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="Invited"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("household_members")
    op.drop_table("saved_recipes")
    op.drop_column("user_profiles", "notification_email")
    op.drop_column("user_profiles", "notify_days_threshold")
    op.drop_column("user_profiles", "notify_push_enabled")
    op.drop_column("user_profiles", "notify_email_enabled")
    op.drop_column("pantry_items", "location")

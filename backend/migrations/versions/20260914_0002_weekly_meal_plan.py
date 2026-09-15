"""add weekly meal plans"""

from alembic import op
import sqlalchemy as sa


revision = "20260914_0002"
down_revision = "20260824_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "weekly_meal_plans",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("week_start", sa.Date(), nullable=False),
        sa.Column("day", sa.String(length=12), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("servings", sa.Integer(), nullable=False),
        sa.Column("ingredients", sa.JSON(), nullable=False),
        sa.Column("missing_ingredients", sa.JSON(), nullable=False),
        sa.UniqueConstraint("user_id", "week_start", "day", name="uq_weekly_meal_plan_day"),
    )
    op.create_index("ix_weekly_meal_plans_user_id", "weekly_meal_plans", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_weekly_meal_plans_user_id", table_name="weekly_meal_plans")
    op.drop_table("weekly_meal_plans")

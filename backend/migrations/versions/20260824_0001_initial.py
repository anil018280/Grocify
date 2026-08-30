"""initial schema"""

from alembic import op
import sqlalchemy as sa


revision = "20260824_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("active_tab", sa.String(length=40), nullable=False, server_default="inventory"),
        sa.Column("focused_mode", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("custom_recipe_name_value", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("calorie_target", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("custom_ingredients", sa.JSON(), nullable=False),
    )

    op.create_table(
        "pantry_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=40), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("days_left", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("nutrition", sa.JSON(), nullable=False),
    )
    op.create_index("ix_pantry_items_user_id", "pantry_items", ["user_id"], unique=False)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
    )
    op.create_index("ix_cart_items_user_id", "cart_items", ["user_id"], unique=False)

    op.create_table(
        "nutrition_entries",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("item_name", sa.String(length=120), nullable=False),
        sa.Column("servings", sa.Float(), nullable=False),
        sa.Column("calories", sa.Float(), nullable=False),
        sa.Column("protein", sa.Float(), nullable=False),
        sa.Column("carbs", sa.Float(), nullable=False),
        sa.Column("fat", sa.Float(), nullable=False),
        sa.Column("fiber", sa.Float(), nullable=False),
    )
    op.create_index("ix_nutrition_entries_user_id", "nutrition_entries", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_nutrition_entries_user_id", table_name="nutrition_entries")
    op.drop_table("nutrition_entries")
    op.drop_index("ix_cart_items_user_id", table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index("ix_pantry_items_user_id", table_name="pantry_items")
    op.drop_table("pantry_items")
    op.drop_table("user_profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

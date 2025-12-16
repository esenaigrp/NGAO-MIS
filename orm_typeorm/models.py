from sqlalchemy import Column, String, Integer, Date, ForeignKey, JSON, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class AdminUnit(Base):
    __tablename__ = 'admin_units'
    unit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    level = Column(String, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('admin_units.unit_id'))

class Officer(Base):
    __tablename__ = 'officers'
    officer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey('admin_units.unit_id'))
    given_name = Column(String)
    family_name = Column(String)
    role = Column(String)
    national_id = Column(String)
    phone = Column(String)
    email = Column(String)
    status = Column(String, default='active')

**Bus Ticket Booking System**
**Overview**
A simple web application that lets bus passengers book tickets, view their bookings, and get tickets by email.

**Features**
**Browse Schedules:** See available bus routes and times

**Book Tickets:** Purchase tickets online

**View Bookings:** Check your ticket history

**Get Tickets by Email:** Receive PDF tickets in your inbox

**Download Tickets:** Save PDF tickets to your device

**How It Works**
**Login:** Clients sign in with their account

**Find a Bus:** Browse available schedules and filter by route

**Book Ticket:** Select a schedule and purchase

**Get Ticket:** Ticket is emailed as PDF and saved in your account

**Technology Used**
**Frontend:** ASP.NET Core Razor Pages
**Backend:** C#, SQL Server
**PDF Generation:** iTextSharp
**Email:** Gmail SMTP via MailKit

**Pages**
**Dashboard (/Clients)**
Shows your profile
Quick links to main features

**Purchase Tickets (/Clients/Purchase)**
View all available bus schedules
Filter by route and bus
Book tickets with one click

**My Tickets (/Clients/Tickets)**
See all your purchased tickets
Download PDF tickets

**Ticket Process**
Select a bus schedule
System books the ticket
PDF ticket is generated
Ticket is emailed to you
Ticket appears in "My Tickets"

**Email Setup**
The system uses Gmail to send tickets. For this to work:
Gmail account must have 2-factor authentication enabled
App-specific password must be generated
Email credentials are configured in the app

**Security**
Only logged-in clients can access
Clients can only see their own tickets
Secure password handling

**Installation & Setup**
Clone the repository
Update database connection string
Configure email settings
Build and run the application

**Common Issues & Solutions**
**Emails Not Sending**
Check Gmail app password is correct
Verify SMTP settings
Check firewall allows port 587

**PDF Not Generating**
Ensure iTextSharp package is installed
Check ticket data exists in database

**Tickets Not Showing**
Verify you're logged in
Check database connection is working

**Future Improvements**
Seat selection
Online payment
Ticket cancellation
SMS notifications
Mobile app version

**Developer**
Didace
Created by Didace

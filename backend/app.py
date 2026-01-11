


from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import jwt
import datetime
import os
from db import get_db_connection
from functools import wraps

# ---------------- APP SETUP ----------------
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")



CORS(app)

# ---------------- JWT AUTH DECORATOR ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or invalid"}), 401

        token = auth_header.split(" ")[1]

        try:
            data = jwt.decode(
                token,
                app.config["SECRET_KEY"],
                algorithms=["HS256"]
            )
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated


# ---------------- ROLE-BASED AUTH DECORATOR ----------------
def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = request.user

            if user["role"] not in allowed_roles:
                return jsonify({
                    "error": "Access denied",
                    "required_roles": allowed_roles,
                    "your_role": user["role"]
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ---------------- HOME ----------------
@app.route("/")
def home():
    return "BloodLink backend is running"


# ---------------- TEST DB ----------------
@app.route("/test-db")
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- CREATE USER ----------------
@app.route("/users", methods=["POST"])
def create_user():
    data = request.json or {}

    required_fields = ["full_name", "email", "password", "role"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    hashed_password = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO users (full_name, email, password_hash, role, phone, city)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data["full_name"],
                data["email"],
                hashed_password.decode("utf-8"),
                data["role"],
                data.get("phone"),
                data.get("city")
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}

    if "email" not in data or "password" not in data:
        return jsonify({"error": "email and password are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT user_id, email, password_hash, role FROM users WHERE email = %s",
            (data["email"],)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        if not bcrypt.checkpw(
            data["password"].encode("utf-8"),
            user["password_hash"].encode("utf-8")
        ):
            return jsonify({"error": "Invalid email or password"}), 401

        token = jwt.encode(
            {
                "user_id": user["user_id"],
                "email": user["email"],
                "role": user["role"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            },
            app.config["SECRET_KEY"],
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful",
            "token": token
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- GET CURRENT USER ----------------
@app.route("/me", methods=["GET"])
@token_required
def get_my_profile():
    user_id = request.user["user_id"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id, full_name, email, role, phone, city, created_at
            FROM users
            WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- ADMIN DASHBOARD ----------------
@app.route("/admin/dashboard")
@token_required
@role_required("admin")
def admin_dashboard():
    return jsonify({"message": "Welcome Admin"})


# ---------------- DONOR DASHBOARD ----------------
@app.route("/donor/dashboard")
@token_required
@role_required("donor")
def donor_dashboard():
    return jsonify({"message": "Welcome Donor"})


# ---------------- BLOOD BANK MANAGEMENT ----------------
@app.route("/admin/blood-banks", methods=["POST"])
@token_required
@role_required("admin")
def create_blood_bank():
    data = request.json or {}

    required = ["name", "city", "address", "contact_number"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO blood_banks (name, city, address, contact_number, admin_user_id)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data["name"],
                data["city"],
                data["address"],
                data["contact_number"],
                request.user["user_id"]
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Blood bank created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/blood-banks", methods=["GET"])
@token_required
@role_required("admin")
def get_blood_banks():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT bb.*, u.full_name AS admin_name
            FROM blood_banks bb
            JOIN users u ON bb.admin_user_id = u.user_id
        """)

        banks = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(banks), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/blood-banks", methods=["GET"])
@token_required
def list_blood_banks():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT blood_bank_id, name, city
            FROM blood_banks
        """)

        banks = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(banks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/admin/blood-banks/<int:bank_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_blood_bank(bank_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM blood_banks
            WHERE blood_bank_id = %s AND admin_user_id = %s
            """,
            (bank_id, request.user["user_id"])
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Blood bank deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#-----------------bllood inventory------------
@app.route("/inventory/<int:blood_bank_id>", methods=["GET"])
def get_inventory(blood_bank_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT blood_group, SUM(units_available) AS total_units
            FROM blood_inventory
            WHERE blood_bank_id = %s
              AND status = 'available'
              AND expiry_date >= CURDATE()
            GROUP BY blood_group
        """, (blood_bank_id,))

        inventory = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "blood_bank_id": blood_bank_id,
            "inventory": inventory
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#-----------donor registration------------
@app.route("/donors/register", methods=["POST"])
@token_required
def register_donor():
    user_id = request.user["user_id"]
    data = request.get_json()

    blood_group = data.get("blood_group")
    if not blood_group:
        return jsonify({"error": "blood_group is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if already a donor
        cursor.execute(
            "SELECT donor_id FROM donors WHERE user_id = %s",
            (user_id,)
        )
        existing = cursor.fetchone()

        if existing:
            return jsonify({"error": "User already registered as donor"}), 400

        # Register donor
        cursor.execute("""
            INSERT INTO donors (user_id, blood_group, eligible)
            VALUES (%s, %s, 1)
        """, (user_id, blood_group))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Donor registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#----------------donor details--------------
@app.route("/donors/me", methods=["GET"])
@token_required
def get_my_donor_profile():
    user_id = request.user["user_id"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT donor_id, user_id, blood_group,
                   last_donation_date, eligible
            FROM donors
            WHERE user_id = %s
        """, (user_id,))

        donor = cursor.fetchone()
        cursor.close()
        conn.close()

        if not donor:
            return jsonify({"error": "User is not registered as donor"}), 404

        # Convert tinyint to boolean
        donor["eligible"] = bool(donor["eligible"])

        return jsonify(donor), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#----------------record blood donation-------------

@app.route("/donations", methods=["POST"])
@token_required
def donate_blood():
    user_id = request.user["user_id"]
    data = request.json

    blood_bank_id = data.get("blood_bank_id")
    quantity_units = data.get("quantity_units")
    emergency = data.get("emergency", False)

    if not blood_bank_id or not quantity_units:
        return jsonify({"error": "blood_bank_id and quantity_units required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1️⃣ Get donor
        cursor.execute("""
            SELECT donor_id, blood_group, eligible, total_donations
            FROM donors
            WHERE user_id = %s
        """, (user_id,))
        donor = cursor.fetchone()

        if not donor:
            return jsonify({"error": "User is not registered as donor"}), 404

        if not donor["eligible"]:
            return jsonify({"error": "Donor is not eligible"}), 400

        donor_id = donor["donor_id"]
        blood_group = donor["blood_group"]

        # 2️⃣ Record donation
        cursor.execute("""
            INSERT INTO donation_history
            (donor_id, blood_bank_id, donation_date, quantity_units)
            VALUES (%s, %s, CURDATE(), %s)
        """, (donor_id, blood_bank_id, quantity_units))

        # 3️⃣ Update inventory
        cursor.execute("""
            INSERT INTO blood_inventory
            (blood_bank_id, blood_group, units_available,
             collection_date, expiry_date, status)
            VALUES (%s, %s, %s, CURDATE(),
                    DATE_ADD(CURDATE(), INTERVAL 42 DAY), 'available')
        """, (blood_bank_id, blood_group, quantity_units))

        # 4️⃣ Reward calculation
        points = 100
        if emergency:
            points += 100

        total_donations = donor["total_donations"] + 1

        # 5️⃣ Update donor stats
        cursor.execute("""
            UPDATE donors
            SET last_donation_date = CURDATE(),
                eligible = 0,
                points = points + %s,
                total_donations = total_donations + 1
            WHERE donor_id = %s
        """, (points, donor_id))

        # 6️⃣ Badge logic
        badge = None
        if total_donations == 1:
            badge = "First Drop"
        elif total_donations == 3:
            badge = "Lifesaver"
        elif total_donations == 10:
            badge = "Elite Donor"

        if badge:
            cursor.execute("""
                INSERT INTO donor_badges (donor_id, badge_name)
                VALUES (%s, %s)
            """, (donor_id, badge))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Donation successful",
            "points_awarded": points,
            "badge_awarded": badge
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

#-------------create blood request=============
@app.route("/blood-requests", methods=["POST"])
@token_required
def create_blood_request():
    data = request.get_json()
    user_id = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO blood_requests
        (user_id, blood_group, quantity_units, urgency, city)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        user_id,
        data["blood_group"],
        data["quantity_units"],
        data.get("urgency", "normal"),
        data.get("city")
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Blood request created"}), 201


#-------------view blood request------------
@app.route("/blood-requests", methods=["GET"])
@token_required
@role_required("admin", "hospital")

def view_blood_requests():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                request_id,
                user_id,
                blood_group,
                quantity_units,
                urgency,
                city,
                status,
                request_date
            FROM blood_requests
            ORDER BY request_date DESC
        """)

        requests = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(requests), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
#---------------------approve and reject blood request-------------

@app.route("/blood-requests/<int:request_id>/status", methods=["PUT"])


@token_required
@role_required("admin")
def update_blood_request_status(request_id):
    data = request.json
    new_status = data.get("status")

    if new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE blood_requests
            SET status = %s
            WHERE request_id = %s
        """, (new_status, request_id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": f"Request {new_status}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



#------------------------fulfill blood request---------------
@app.route("/blood-requests/<int:request_id>/fulfill", methods=["POST"])


@token_required
@role_required("admin")
def fulfill_blood_request(request_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Get request
        cursor.execute("""
            SELECT blood_group, quantity_units, status
            FROM blood_requests
            WHERE request_id = %s
        """, (request_id,))
        request_data = cursor.fetchone()

        if not request_data:
            return jsonify({"error": "Request not found"}), 404

        if request_data["status"] != "approved":
            return jsonify({"error": "Request must be approved first"}), 400

        blood_group = request_data["blood_group"]
        needed_units = request_data["quantity_units"]

        # 2. Check inventory
        cursor.execute("""
            SELECT inventory_id, units_available
            FROM blood_inventory
            WHERE blood_group = %s
              AND status = 'available'
              AND expiry_date >= CURDATE()
            ORDER BY expiry_date ASC
            LIMIT 1
        """, (blood_group,))

        inventory = cursor.fetchone()

        if not inventory or inventory["units_available"] < needed_units:
            return jsonify({"error": "Insufficient blood stock"}), 400

        # 3. Deduct units
        cursor.execute("""
            UPDATE blood_inventory
            SET units_available = units_available - %s
            WHERE inventory_id = %s
        """, (needed_units, inventory["inventory_id"]))

        # 4. Mark request fulfilled
        cursor.execute("""
            UPDATE blood_requests
            SET status = 'fulfilled'
            WHERE request_id = %s
        """, (request_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Blood request fulfilled successfully",
            "request_id": request_id
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500


#--------------------blood request donor matching----------
@app.route("/blood-requests/<int:request_id>/match-donors", methods=["GET"])
@token_required
@role_required("admin", "hospital")
def match_donors(request_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get request details
        cursor.execute("""
            SELECT blood_group, city, urgency
            FROM blood_requests
            WHERE request_id = %s
        """, (request_id,))
        request_data = cursor.fetchone()

        if not request_data:
            return jsonify({"error": "Request not found"}), 404

        if request_data["urgency"] != "emergency":
            return jsonify({"message": "Matching only for emergency requests"}), 200

        # Find matching donors
        cursor.execute("""
            SELECT d.donor_id, u.full_name, u.phone
            FROM donors d
            JOIN users u ON d.user_id = u.user_id
            WHERE d.blood_group = %s
              AND u.city = %s
              AND d.eligible = 1
        """, (request_data["blood_group"], request_data["city"]))

        donors = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "matched_donors": donors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- DONATION HISTORY (DONOR) ----------------
@app.route("/donations/me", methods=["GET"])
@token_required
@role_required("donor")
def get_my_donations():
    user_id = request.user["user_id"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                dh.donation_date,
                dh.quantity_units,
                bb.name AS blood_bank_name,
                bb.city
            FROM donation_history dh
            JOIN donors d ON dh.donor_id = d.donor_id
            JOIN blood_banks bb ON dh.blood_bank_id = bb.blood_bank_id
            WHERE d.user_id = %s
            ORDER BY dh.donation_date DESC
        """, (user_id,))

        history = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(history), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/blood-requests/me", methods=["GET"])
@token_required
def my_blood_requests():
    user_id = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT request_id, blood_group, quantity_units,
               urgency, city, status, request_date
        FROM blood_requests
        WHERE user_id = %s
        ORDER BY request_date DESC
    """, (user_id,))

    requests = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(requests), 200


#----------------inventory summary--------------
@app.route("/inventory/summary", methods=["GET"])
@token_required
@role_required("admin")
def inventory_summary():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT blood_group, SUM(units_available) AS total_units
            FROM blood_inventory
            GROUP BY blood_group
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/donors/reset-eligibility", methods=["POST"])
def reset_eligibility():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE donors
        SET eligible = 1
        WHERE last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 42 DAY)
    """)

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Eligibility reset"}), 200




# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)

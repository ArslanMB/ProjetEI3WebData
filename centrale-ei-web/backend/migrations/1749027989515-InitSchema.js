/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class InitSchema1749027989515 {
    name = 'InitSchema1749027989515'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "username" varchar NOT NULL,
                "email" varchar NOT NULL,
                "birthYear" integer NOT NULL,
                "passwordHash" varchar NOT NULL,
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "movies" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "title" varchar NOT NULL,
                "release_date" text NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "userId" integer NOT NULL,
                "movieId" integer NOT NULL,
                CONSTRAINT "UQ_user_movie" UNIQUE ("userId", "movieId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_reviews" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "userId" integer NOT NULL,
                "movieId" integer NOT NULL,
                CONSTRAINT "UQ_user_movie" UNIQUE ("userId", "movieId"),
                CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_e50936dfdefcaf083d446baca11" FOREIGN KEY ("movieId") REFERENCES "movies" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_reviews"("id", "rating", "comment", "userId", "movieId")
            SELECT "id",
                "rating",
                "comment",
                "userId",
                "movieId"
            FROM "reviews"
        `);
        await queryRunner.query(`
            DROP TABLE "reviews"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_reviews"
                RENAME TO "reviews"
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "reviews"
                RENAME TO "temporary_reviews"
        `);
        await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "userId" integer NOT NULL,
                "movieId" integer NOT NULL,
                CONSTRAINT "UQ_user_movie" UNIQUE ("userId", "movieId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "reviews"("id", "rating", "comment", "userId", "movieId")
            SELECT "id",
                "rating",
                "comment",
                "userId",
                "movieId"
            FROM "temporary_reviews"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_reviews"
        `);
        await queryRunner.query(`
            DROP TABLE "reviews"
        `);
        await queryRunner.query(`
            DROP TABLE "movies"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }
}

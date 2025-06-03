export default class InitSchema1748941908550 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" VARCHAR NOT NULL,
        "release_date" TEXT NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "email" VARCHAR NOT NULL UNIQUE,
        "firstname" VARCHAR NOT NULL,
        "lastname" VARCHAR NOT NULL
      );
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TABLE "movies";`);
  }
}
